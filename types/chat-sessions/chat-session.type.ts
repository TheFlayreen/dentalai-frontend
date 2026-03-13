import { IUserScenarioVersion } from '@/types/scenario/scenario.type';
import { IPagination } from '@/types/pagination.type';
import { ScenarioEvaluation } from '@/types/chat-sessions/session-evaluation.type';
import { IDifficulty } from '@/types/difficulties/difficulty.type';

export interface IChatSession {
  id: string;
  scenarioId: string;
  userId: string;
  scenarioVersion: IUserScenarioVersion & { version: number};
  evaluation: ScenarioEvaluation | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChatSessionShort {
  id: string;
  scenarioId: string;
  userId: string;
  performance_score?: number;
  duration: number;
  difficulty: IDifficulty;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}


export interface IChatSessionWithPagination {
  items: IChatSessionShort[];
  pagination: IPagination;
}