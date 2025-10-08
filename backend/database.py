import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import joblib
from datetime import datetime
from typing import Dict, List, Optional, Any
import base64

class ModelDB:
    """Database operations for ML Models using PostgreSQL"""

    def __init__(self):
        self.connection_string = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/stocksight')

    def get_connection(self):
        """Get database connection"""
        return psycopg2.connect(self.connection_string)

    def save_model(self, model_data: Dict[str, Any]) -> str:
        """
        Save model to database

        Args:
            model_data: Dictionary containing model information

        Returns:
            model_id: The ID of the saved model
        """
        query = """
        INSERT INTO ml_models (name, version, model_type, model_data, metadata, features, trained_by, description)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id
        """

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (
                    model_data.get('name', 'Stock Prediction Model'),
                    model_data.get('version', '1.0.0'),
                    model_data.get('model_type', 'stock_prediction'),
                    json.dumps(model_data.get('model_data', {})),
                    json.dumps(model_data.get('metadata', {})),
                    json.dumps(model_data.get('features', [])),
                    model_data.get('trained_by'),
                    model_data.get('description')
                ))
                model_id = cursor.fetchone()[0]
                conn.commit()
                return model_id

    def get_active_model(self, model_type: str) -> Optional[Dict[str, Any]]:
        """
        Get the active model of specified type

        Args:
            model_type: Type of model to retrieve

        Returns:
            Model data or None if not found
        """
        query = """
        SELECT * FROM ml_models
        WHERE model_type = %s AND is_active = 1
        ORDER BY created_at DESC
        LIMIT 1
        """

        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, (model_type,))
                result = cursor.fetchone()
                return dict(result) if result else None

    def get_model_by_id(self, model_id: str) -> Optional[Dict[str, Any]]:
        """
        Get model by ID

        Args:
            model_id: Model ID to retrieve

        Returns:
            Model data or None if not found
        """
        query = "SELECT * FROM ml_models WHERE id = %s"

        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, (model_id,))
                result = cursor.fetchone()
                return dict(result) if result else None

    def list_models(self, model_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        List all models or filter by type

        Args:
            model_type: Optional model type filter

        Returns:
            List of model records
        """
        if model_type:
            query = "SELECT id, name, version, model_type, created_at, is_active, trained_by, description FROM ml_models WHERE model_type = %s ORDER BY created_at DESC"
            params = (model_type,)
        else:
            query = "SELECT id, name, version, model_type, created_at, is_active, trained_by, description FROM ml_models ORDER BY created_at DESC"
            params = ()

        with self.get_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query, params)
                results = cursor.fetchall()
                return [dict(row) for row in results]

    def update_model_status(self, model_id: str, is_active: int) -> bool:
        """
        Update model active status

        Args:
            model_id: Model ID to update
            is_active: New active status (1 or 0)

        Returns:
            Success status
        """
        query = "UPDATE ml_models SET is_active = %s, updated_at = NOW() WHERE id = %s"

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (is_active, model_id))
                conn.commit()
                return cursor.rowcount > 0

    def delete_model(self, model_id: str) -> bool:
        """
        Delete model from database

        Args:
            model_id: Model ID to delete

        Returns:
            Success status
        """
        query = "DELETE FROM ml_models WHERE id = %s"

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(query, (model_id,))
                conn.commit()
                return cursor.rowcount > 0

    def model_file_to_db(self, model_path: str, metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Convert model file to database format

        Args:
            model_path: Path to the .pkl model file
            metadata: Optional metadata dictionary

        Returns:
            Model data ready for database storage
        """
        try:
            # Read the model file as bytes
            with open(model_path, 'rb') as f:
                model_bytes = f.read()

            # Convert to base64 for JSON storage
            model_base64 = base64.b64encode(model_bytes).decode('utf-8')

            # Load metadata if available
            metadata = metadata or {}
            if os.path.exists(model_path.replace('.pkl', '_metadata.pkl')):
                try:
                    metadata.update(joblib.load(model_path.replace('.pkl', '_metadata.pkl')))
                except:
                    pass

            return {
                'model_data': {
                    'type': 'base64',
                    'data': model_base64,
                    'original_size': len(model_bytes)
                },
                'metadata': metadata
            }
        except Exception as e:
            print(f"Error converting model file to DB format: {e}")
            raise

    def model_db_to_file(self, model_data: Dict[str, Any], output_path: str) -> bool:
        """
        Convert database model to file

        Args:
            model_data: Model data from database
            output_path: Path where to save the model file

        Returns:
            Success status
        """
        try:
            if model_data.get('model_data', {}).get('type') == 'base64':
                # Decode base64 back to bytes
                model_base64 = model_data['model_data']['data']
                model_bytes = base64.b64decode(model_base64)

                # Write to file
                with open(output_path, 'wb') as f:
                    f.write(model_bytes)

                return True
            return False
        except Exception as e:
            print(f"Error converting DB model to file: {e}")
            raise

# Global database instance
db_instance = ModelDB()

# Convenience functions
def save_model_to_db(model_path: str, model_type: str = 'stock_prediction', **kwargs) -> str:
    """Save model from file to database"""
    db_model = ModelDB()
    model_data = db_model.model_file_to_db(model_path)
    model_data.update({
        'model_type': model_type,
        **kwargs
    })
    return db_model.save_model(model_data)

def load_model_from_db(model_type: str = 'stock_prediction', output_path: Optional[str] = None) -> Any:
    """Load model from database"""
    db_model = ModelDB()
    model_data = db_model.get_active_model(model_type)

    if not model_data:
        raise FileNotFoundError(f"No active {model_type} model found in database")

    if output_path:
        db_model.model_db_to_file(model_data, output_path)
        return joblib.load(output_path)
    else:
        # Create temporary file and load
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.pkl', delete=False) as tmp:
            db_model.model_db_to_file(model_data, tmp.name)
            model = joblib.load(tmp.name)
            os.unlink(tmp.name)
            return model

def get_db_model_metadata(model_type: str = 'stock_prediction') -> Optional[Dict[str, Any]]:
    """Get metadata of active model"""
    db_model = ModelDB()
    model_data = db_model.get_active_model(model_type)
    return model_data.get('metadata') if model_data else None
