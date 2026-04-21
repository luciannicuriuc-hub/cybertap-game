const compactFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const decimalFormatter = new Intl.NumberFormat('en-US');

export function formatNumber(value) {
  return decimalFormatter.format(Number(value ?? 0));
}

export function formatCompact(value) {
  return compactFormatter.format(Number(value ?? 0));
}

export function formatUsername(value) {
  if (!value) {
    return '@operator';
  }

  return value.startsWith('@') ? value : `@${value}`;
}
