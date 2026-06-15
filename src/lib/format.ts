export function formatUsd(amount: number): string {
  const rounded = Math.round(amount);
  return `US$${rounded.toLocaleString('en-US')}`;
}
