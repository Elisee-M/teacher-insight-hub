import { AttendanceCondition } from '@/types/teacher';
import { getConditionColor, getConditionLabel } from '@/utils/attendanceAnalyzer';
import { Badge } from '@/components/ui/badge';

interface ConditionBadgeProps {
  condition: AttendanceCondition;
}

export function ConditionBadge({ condition }: ConditionBadgeProps) {
  const colorClass = getConditionColor(condition);
  const label = getConditionLabel(condition);

  const variantMap: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
    success: 'default',
    info: 'default',
    warning: 'default',
    destructive: 'destructive',
  };

  return (
    <Badge 
      variant={variantMap[colorClass]} 
      className={`
        ${colorClass === 'success' ? 'bg-success text-success-foreground hover:bg-success/90' : ''}
        ${colorClass === 'info' ? 'bg-info text-info-foreground hover:bg-info/90' : ''}
        ${colorClass === 'warning' ? 'bg-warning text-warning-foreground hover:bg-warning/90' : ''}
      `}
    >
      {label}
    </Badge>
  );
}
