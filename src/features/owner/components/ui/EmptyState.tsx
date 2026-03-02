import React from 'react';
import { Button } from '@/components/ui/button';

type EmptyStateProps = {
  icon: React.ReactNode;
  title: string;
  description?: string;
  primaryCta?: { label: string; onClick?: () => void };
  secondaryCta?: { label: string; onClick?: () => void };
  className?: string;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  primaryCta,
  secondaryCta,
  className
}) => {
  return (
    <div className={className}>
      <div className="flex items-center justify-between rounded-[16px] border border-white/10 bg-[#0F1A2B] p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#102339] border border-white/10 flex items-center justify-center">
            {icon}
          </div>
          <div>
            <div className="text-sm font-medium text-[#E6EDF7]">{title}</div>
            {description && <div className="text-sm text-[#9AA7BD]">{description}</div>}
          </div>
        </div>
        <div className="flex gap-2">
          {primaryCta && (
            <Button className="bg-[#3B82F6] hover:bg-[#316fd1] text-white" onClick={primaryCta.onClick}>
              {primaryCta.label}
            </Button>
          )}
          {secondaryCta && (
            <Button variant="outline" className="border-white/10 text-[#E6EDF7]" onClick={secondaryCta.onClick}>
              {secondaryCta.label}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
