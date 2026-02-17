import {
  ScenarioCallerType,
  ScenarioDifficulty,
  ScenarioStatus,
  ScenarioTone,
} from '@/types/scenario/scenario.enum';
import { IPagination } from '@/types/pagination.type';

export interface IScenario {
  id: string;
  status: ScenarioStatus;
  currentVersion: IScenarioVersion;
}

export interface IScenarioVersion {
  id: string;
  version: number;
  title: string;
  description: string;
  categoryId: string;
  difficulty: ScenarioDifficulty;
  callerType: ScenarioCallerType;
  tone: ScenarioTone;
  urgency: number;
  backstory: string;
  goals: string[];
  objections: string[];
  requiredPhrases: string[];
  forbiddenPhrases: string[];
  mustAskQuestions: string[];
  complianceRules: string[];
  expectedBehaviorsChecklist: string[];
  warmthTone: number;
  rapportName: number;
  timingDiscipline: number;
  accuracyCompliance: number;
  objectionHandling: number;
  closeConfirmation: number;
  controlForward: number;
  createdAt: string;
  updatedAt: string;
  adminFeedback: string;
}

export interface IScenariosWithPagination {
  items: IScenario[];
  pagination: IPagination;
}
