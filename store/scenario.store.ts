import { create } from 'zustand/react';
import { IScenarioCounts } from '@/types/scenario/scenario-counts.type';
import { apiClient } from '@/lib/api-client';
import { IScenario, IScenariosWithPagination } from '@/types/scenario/scenario.type';
import {
  ScenarioCallerType,
  ScenarioDifficulty,
  ScenarioStatus,
  ScenarioTone,
} from '@/types/scenario/scenario.enum';
import { IPagination } from '@/types/pagination.type';

interface CreateScenarioPayload {
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
  warmthTone?: number;
  rapportName?: number;
  timingDiscipline?: number;
  accuracyCompliance?: number;
  objectionHandling?: number;
  closeConfirmation?: number;
  controlForward?: number;
  adminFeedback?: string;
}

interface ScenarioStore {
  counts: {
    data: IScenarioCounts;
    isLoading: boolean;
    fetchCounts: () => Promise<void>;
  };
  scenarios: {
    items: IScenario[];
    pagination: IPagination;
    isLoading: boolean;
    fetchScenarios: (
      status?: ScenarioStatus | undefined,
      page?: number,
      limit?: number,
    ) => Promise<void>;
    changeScenarioStatus: (scenarioId: string, status: ScenarioStatus) => Promise<void>;
    createScenario: (
      dto: CreateScenarioPayload,
      status: ScenarioStatus,
    ) => Promise<IScenario | null>;
    updateScenario: (
      scenarioId: string,
      dto: Partial<CreateScenarioPayload>,
      status: ScenarioStatus,
    ) => Promise<IScenario | null>;
  };
}

export const useScenarioStore = create<ScenarioStore>((set, get) => ({
  counts: {
    data: { all: 0, published: 0, archived: 0, drafts: 0 },
    isLoading: false,
    fetchCounts: async (): Promise<void> => {
      set((state) => ({ counts: { ...state.counts, isLoading: true } }));
      try {
        const response: IScenarioCounts = await apiClient.get('/scenarios/counts');
        set((state) => ({ counts: { ...state.counts, data: response } }));
      } catch (e) {
        console.log(e);
      } finally {
        set((state) => ({ counts: { ...state.counts, isLoading: false } }));
      }
    },
  },
  scenarios: {
    items: [],
    pagination: {
      page: 1,
      limit: 10,
      totalPages: 1,
    },
    isLoading: false,
    fetchScenarios: async (
      status?: ScenarioStatus,
      page: number = get().scenarios.pagination.page,
      limit: number = get().scenarios.pagination.limit,
    ): Promise<void> => {
      set((state) => ({ scenarios: { ...state.scenarios, isLoading: true } }));
      try {
        let query: string = `?page=${page}&limit=${limit}`;
        if (status) query += `&status=${status}`;
        const response: IScenariosWithPagination = await apiClient.get('/scenarios' + query);
        set((state) => ({
          scenarios: {
            ...state.scenarios,
            items: response.items,
            pagination: response.pagination,
          },
        }));
      } catch (e) {
        console.log(e);
      } finally {
        set((state) => ({ scenarios: { ...state.scenarios, isLoading: false } }));
      }
    },
    changeScenarioStatus: async (scenarioId: string, status: ScenarioStatus): Promise<void> => {
      set((state) => ({ scenarios: { ...state.scenarios, isLoading: true } }));
      try {
        const response: IScenario = await apiClient.patch(
          `/scenarios/change-status/${scenarioId}`,
          { status },
        );
        const prevScenario: IScenario | undefined = get().scenarios.items.find(
          (scenario: IScenario) => scenario.id === scenarioId,
        );

        if (prevScenario) {
          set((state) => ({
            scenarios: {
              ...state.scenarios,
              items: state.scenarios.items.map((scenario: IScenario) =>
                scenario.id === scenarioId ? response : scenario,
              ),
            },
          }));

          const prevCounts: IScenarioCounts = get().counts.data;
          if (prevScenario.status === ScenarioStatus.PUBLISHED) prevCounts.published--;
          if (prevScenario.status === ScenarioStatus.ARCHIVED) prevCounts.archived--;
          if (prevScenario.status === ScenarioStatus.DRAFT) prevCounts.drafts--;

          if (response.status === ScenarioStatus.PUBLISHED) prevCounts.published++;
          if (response.status === ScenarioStatus.ARCHIVED) prevCounts.archived++;
          if (response.status === ScenarioStatus.DRAFT) prevCounts.drafts++;

          set((state) => ({ counts: { ...state.counts, data: prevCounts } }));
        }
      } catch (e) {
        console.log(e);
      } finally {
        set((state) => ({ scenarios: { ...state.scenarios, isLoading: false } }));
      }
    },
    createScenario: async (
      dto: CreateScenarioPayload,
      status: ScenarioStatus,
    ): Promise<IScenario | null> => {
      set((state) => ({ scenarios: { ...state.scenarios, isLoading: true } }));
      try {
        const response: IScenario = await apiClient.post('/scenarios/create', { ...dto, status });
        set((state) => ({
          scenarios: {
            ...state.scenarios,
            items: [...state.scenarios.items, response],
          },
        }));

        return response;
      } catch (e) {
        console.log(e);
        return null;
      } finally {
        set((state) => ({ scenarios: { ...state.scenarios, isLoading: false } }));
      }
    },
    updateScenario: async (
      scenarioId: string,
      dto: Partial<CreateScenarioPayload>,
      status: ScenarioStatus,
    ): Promise<IScenario | null> => {
      set((state) => ({ scenarios: { ...state.scenarios, isLoading: true } }));
      try {
        const response: IScenario = await apiClient.patch(`/scenarios/${scenarioId}`, { ...dto, status });
        set((state) => ({
          scenarios: {
            ...state.scenarios,
            items: state.scenarios.items.map((scenario: IScenario) =>
              scenario.id === scenarioId ? response : scenario,
            ),
          },
        }));

        return response;
      } catch (e) {
        console.log(e);
        return null;
      } finally {
        set((state) => ({ scenarios: { ...state.scenarios, isLoading: false } }));
      }
    },
  },
}));
