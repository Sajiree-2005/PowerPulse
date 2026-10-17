import React from 'react';

interface Option<T> {
  id: T;
  label: string;
  badge?: string;
}

interface SegmentedControlProps<T> {
  options: Option<T>[];
  value: T;
  onChange: (val: T) => void;
  size?: 'sm' | 'md';
}

export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200/90 bg-slate-100/90 p-1"
    >
      {options.map((option) => {
        const isSelected = option.id === value;
        return (
          <button
            key={String(option.id)}
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.id)}
            className={`flex items-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-all duration-150 ${
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs sm:text-sm'
            } ${
              isSelected
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <span>{option.label}</span>
            {option.badge && (
              <span
                className={`rounded px-1 text-[10px] uppercase font-bold tracking-wider ${
                  isSelected
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {option.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
