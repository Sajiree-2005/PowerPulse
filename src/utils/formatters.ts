export function formatKw(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return `${Math.round(val).toLocaleString()} kW`;
}

export function formatKwNumber(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  return Math.round(val).toLocaleString();
}

export function formatPercent(val: number | null | undefined, includeSign = false): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const prefix = includeSign && val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(1)}%`;
}

export function getRiskColor(risk: 'Normal' | 'Moderate' | 'High'): {
  text: string;
  bg: string;
  border: string;
  badge: string;
} {
  switch (risk) {
    case 'High':
      return {
        text: 'text-rose-700',
        bg: 'bg-rose-50',
        border: 'border-rose-200',
        badge: 'text-rose-700 bg-rose-50 border-rose-200',
      };
    case 'Moderate':
      return {
        text: 'text-amber-700',
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        badge: 'text-amber-700 bg-amber-50 border-amber-200',
      };
    case 'Normal':
    default:
      return {
        text: 'text-emerald-700',
        bg: 'bg-emerald-50',
        border: 'border-emerald-200',
        badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
      };
  }
}
