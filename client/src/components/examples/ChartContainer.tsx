import ChartContainer from '../ChartContainer';

export default function ChartContainerExample() {
  return (
    <ChartContainer
      title="Stock Performance"
      subtitle="Last 30 days"
    >
      <div className="h-64 flex items-center justify-center bg-muted rounded-md">
        <p className="text-muted-foreground">Chart content goes here</p>
      </div>
    </ChartContainer>
  );
}
