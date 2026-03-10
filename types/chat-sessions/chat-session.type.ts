import { IUserScenarioVersion } from '@/types/scenario/scenario.type';
import { ChatMessage } from '@/hooks/use-chat-socket';
import { IPagination } from '@/types/pagination.type';
import { ScenarioEvaluation } from '@/types/chat-sessions/session-evaluation.type';

export interface IChatSession {
  id: string;
  scenarioId: string;
  userId: string;
  scenarioVersion: IUserScenarioVersion & { version: number};
  evaluation: ScenarioEvaluation | null;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}


export interface IChatSessionWithPagination {
  items: IChatSession[];
  pagination: IPagination;
}