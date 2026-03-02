import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type StatCardProps = {
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  trendLabel?: string;
  trendPositive?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  trendLabel,
  trendPositive,
  icon,
  className,
  children
}) => {
  return (
    <Card className={cn("rounded-[16px] p-5 bg-[#0F1A2B] border border-white/10 transition-colors hover:bg-[#13223a]", className)}>
      <CardHeader className="p-0 flex items-center justify-between">
        <CardTitle className="text-sm font-medium text-[#9AA7BD]">{title}</CardTitle>
        {icon && (
          <div className="h-9 w-9 rounded-xl bg-[#102339] border border-white/10 flex items-center justify-center">
            {icon}
          </div>
        )}
      </CardHeader>
      <CardContent className="p-0 pt-3">
        <div className="text-3xl font-bold text-[#E6EDF7]">{value}</div>
        {(subtitle || trendLabel) && (
          <div className="mt-1 text-sm text-[#9AA7BD]">
            {subtitle && <span>{subtitle}</span>}
            {trendLabel && (
              <span className={cn("ml-2 font-medium", trendPositive ? "text-[#22C55E]" : "text-[#EF4444]")}>
                {trendLabel}
              </span>
            )}
          </div>
        )}
        {children}
      </CardContent>
    </Card>
  );
};

export default StatCard;
