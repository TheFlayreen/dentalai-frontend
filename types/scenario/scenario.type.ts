import { ScenarioStatus } from '@/types/scenario/scenario.enum';
import { IPagination } from '@/types/pagination.type';
import { ICategory } from '@/types/categories/category.type';
import { IDifficulty } from '@/types/difficulties/difficulty.type';
import { ICallerType } from '@/types/caller-types/caller-type.type';
import { ITone } from '@/types/tones/tone.type';

export interface IScenario {
  id: string;
  status: ScenarioStatus;
  currentVersion: IScenarioVersion;
}

export interface IUserScenario {
  id: string;
  status: ScenarioStatus;
  currentVersion: IUserScenarioVersion;
}

export interface IScenarioVersion {
  id: string;
  version: number;
  title: string;
  description: string;
  categoryId: string;
  category: ICategory;
  difficultyId: string;
  difficulty: IDifficulty;
  callerTypeId: string;
  callerType: ICallerType;
  toneId: string;
  tone: ITone;
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
  referenceDictionary: string;
}

export interface IUserScenarioVersion {
  id: string;
  title: string;
  description: string;
  tone: ITone;
  callerType: ICallerType;
  difficulty: IDifficulty;
  category: ICategory;
}

export interface IScenariosWithPagination {
  items: IScenario[];
  pagination: IPagination;
}
