import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface ScenarioListItemProps {
  className?: string;
  title: string;
  difficulty: string;
  status: string;
  version: number;
  created: string;
  actions: React.ReactNode;
  variant?: 'table' | 'card';
}

export default function ScenarioListItem({
  className,
  title,
  difficulty,
  status,
  version,
  created,
  actions,
  variant = 'table',
}: ScenarioListItemProps) {
  if (variant === 'card') {
    return (
      <Card className={cn('py-4', className)}>
        <CardHeader className="gap-1 px-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">{title}</CardTitle>
            <CardAction className="relative col-auto row-span-1">{actions}</CardAction>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-x-4 gap-y-1 px-4 text-sm">
          <span>
            <span className="text-muted-foreground">Difficulty:</span> {difficulty}
          </span>
          <span>
            <span className="text-muted-foreground">Status:</span> {status}
          </span>
          <span>
            <span className="text-muted-foreground">Version:</span> {version}
          </span>
          <span>
            <span className="text-muted-foreground">Created:</span> {created}
          </span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <TableCell className="whitespace-normal align-top">
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{title}</span>
          <span className="text-muted-foreground text-xs">{difficulty}</span>
        </div>
      </TableCell>
      <TableCell align="center">{status}</TableCell>
      <TableCell align="center">{version}</TableCell>
      <TableCell align="center">{created}</TableCell>
      <TableCell align="center">{actions}</TableCell>
    </>
  );
}
