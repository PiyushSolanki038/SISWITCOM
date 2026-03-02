import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Status = 'pending' | 'active' | 'paid' | 'failed' | string;

const colorMap: Record<string, string> = {
  pending: 'bg-[#2a1f0a] text-[#F59E0B] border-[#F59E0B]/30',
  active: 'bg-[#11203a] text-[#3B82F6] border-[#3B82F6]/30',
  paid: 'bg-[#0f241a] text-[#22C55E] border-[#22C55E]/30',
  failed: 'bg-[#2a1212] text-[#EF4444] border-[#EF4444]/30',
};

type StatusBadgeProps = {
  status: Status;
  children?: React.ReactNode;
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, children }) => {
  const key = (status || '').toString().toLowerCase();
  const cls = colorMap[key] || 'bg-[#102339] text-[#9AA7BD] border-white/10';
  return (
    <Badge variant="outline" className={cn('border', cls)}>
      {children ?? status}
    </Badge>
  );
};

export default StatusBadge;
