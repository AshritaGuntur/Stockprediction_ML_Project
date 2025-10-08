import ErrorMessage from '../ErrorMessage';

export default function ErrorMessageExample() {
  return (
    <ErrorMessage
      message="Failed to fetch stock data. Please try again."
      onRetry={() => console.log('Retry clicked')}
    />
  );
}
