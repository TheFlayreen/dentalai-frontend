import { IChatSession } from '@/types/chat-sessions/chat-session.type';
import { cn, getDurationTime } from '@/lib/utils';
import { format } from 'date-fns';
import { Info } from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';

interface ISessionEvaluation {
  session: IChatSession;
  className?: string;
}

export default function SessionEvaluation({ session, className }: ISessionEvaluation) {
  const { scores, coaching } = session.evaluation!.payload;
  return (
    <div className={cn('flex flex-col gap-4 min-w-[300px] p-5', className)}>
      <div className="border-b border-b-border pb-2">
        <span className="text-lg font-semibold">Call Details</span>
      </div>
      <div className="flex flex-col gap-1 border-b border-b-border pb-2">
        <span className="text-muted-foreground">Trust status</span>
        <p className="font-medium">{scores.support_level_label}</p>
      </div>
      <div className="flex flex-row items-center justify-between border-b border-b-border pb-2">
        <div className="flex flex-col gap-2">
          <div className="flex flex-row gap-1">
            <span className="text-muted-foreground">Date:</span>
            <span className="font-medium">{format(session.createdAt, 'EEE MMM dd yyyy')}</span>
          </div>
          <div className="flex flex-row gap-1">
            <span className="text-muted-foreground">Duration:</span>
            <span className="font-medium">
              {getDurationTime(
                session.messages[0].createdAt,
                session.messages[session.messages.length - 1].createdAt,
              )}
            </span>
          </div>
        </div>
        <div className="flex flex-col justify-end items-end">
          <span className="text-sm text-muted-foreground">Overall score</span>
          <span className="text-3xl font-semibold">
            {session.evaluation!.payload.scores.performance_score}%
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2 border-b border-b-border pb-4">
        {scores.by_category.map((category, index) => (
          <div className="flex flex-col gap-1 p-2 border-2 border-border" key={index}>
            <div className="flex flex-row items-start justify-between">
              <span className="text-muted-foreground">{category.category}</span>
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Info className="h-4 w-4 cursor-pointer" />
                </HoverCardTrigger>
                <HoverCardContent className="md:w-[300px] flex flex-col gap-4">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Evidence:</span>
                    <ul>
                      {category.evidence.map((evidence, index) => (
                        <li key={index}>- {evidence}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Rationale:</span>
                    <span>{category.rationale}</span>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <span className="font-semibold">{category.score}/10</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground">Model call example</span>
        <div className="flex flex-col gap-2 w-full p-3 border border-border rounded-lg max-h-[500px] overflow-y-auto">
          {coaching.model_call_example.map((example, index) => (
            <div
              className={cn(
                'flex flex-row gap-2 w-full',
                index % 2 === 0 ? 'justify-end' : 'justify-start',
              )}
              key={index}
            >
              <div className="max-w-[80%] rounded-lg bg-primary/10 p-2">
                <span>{example}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-4 border-b border-b-border pb-4">
        <div className="flex flex-col">
          <span className="text-muted-foreground">Top strengths</span>
          <ul>
            {coaching.strengths.map((strength, index) => (
              <li key={index}>- {strength}</li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Top missed opportunities</span>
          <ul>
            {coaching.missed_psychological_leverage.map((strength, index) => (
              <li key={index}>- {strength}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-muted-foreground">Chat history</span>
        <div className="flex flex-col gap-2 w-full p-3 border border-border rounded-lg max-h-[500px] overflow-y-auto">
          {session.messages.map((message, index) => (
            <div
              className={cn(
                'flex flex-row gap-2 w-full',
                message.role === 'user' ? 'justify-end' : 'justify-start',
              )}
              key={index}
            >
              <div className={cn('max-w-[80%] rounded-lg p-2', message.role === 'user' ? 'bg-primary/20' : 'border border-primary/20')}>
                <span>{message.content}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
