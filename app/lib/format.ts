export function formatSolAmount(lamports: number): string {
  const sol = lamports / 1e9;
  return `${sol.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} SOL`;
} 