import StockCard from '../StockCard';

export default function StockCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <StockCard
        symbol="AAPL"
        name="Apple Inc."
        price={182.45}
        change={3.25}
        changePercent={1.81}
        onClick={() => console.log('AAPL clicked')}
      />
      <StockCard
        symbol="GOOGL"
        name="Alphabet Inc."
        price={139.82}
        change={-1.15}
        changePercent={-0.82}
        onClick={() => console.log('GOOGL clicked')}
      />
    </div>
  );
}
