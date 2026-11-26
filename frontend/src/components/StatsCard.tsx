import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trendText?: string;
  trendType?: 'up' | 'down' | 'neutral';
  colorTheme?: 'blue' | 'green' | 'red' | 'amber';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trendText,
  trendType = 'neutral',
  colorTheme = 'blue'
}) => {
  const themeClasses = {
    blue: {
      bg: 'bg-clinical-50 text-clinical-600 border-clinical-100',
      iconBg: 'bg-clinical-100',
    },
    green: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      iconBg: 'bg-emerald-100',
    },
    red: {
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      iconBg: 'bg-rose-100',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      iconBg: 'bg-amber-100',
    }
  };

  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-rose-600',
    neutral: 'text-slate-500'
  };

  const activeTheme = themeClasses[colorTheme] || themeClasses.blue;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 transition-all hover:shadow-md hover:border-slate-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800 mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg ${activeTheme.iconBg} ${activeTheme.bg}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trendText && (
        <div className="mt-4 flex items-center gap-1.5">
          <span className={`text-xs font-medium ${trendColors[trendType]}`}>{trendText}</span>
          <span className="text-[10px] text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};
