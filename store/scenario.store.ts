import { create } from 'zustand/react';
import { IScenarioCounts } from '@/types/scenario/scenario-counts.type';
import { apiClient } from '@/lib/api-client';
import { IScenario, IScenariosWithPagination } from '@/types/scenario/scenario.type';
import { ScenarioStatus } from '@/types/scenario/scenario.enum';
import { IPagination } from '@/types/pagination.type';
import Cookies from 'js-cookie';

const SERVER_URL: string = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface CreateScenarioPayload {
  title: string;
  description: string;
  categoryId: string;
  difficultyId: string;
  callerTypeId: string;
  toneId: string;
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
  referenceDictionary?: string;
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
    parseScenarioFile: (file: File) => Promise<CreateScenarioPayload | string>;
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
        const response: IScenario = await apiClient.patch(`/scenarios/${scenarioId}`, {
          ...dto,
          status,
        });
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
    parseScenarioFile: async (file: File): Promise<CreateScenarioPayload | string> => {
      set((state) => ({ scenarios: { ...state.scenarios, isLoading: true } }));
      const accessToken = Cookies.get('accessToken');

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${SERVER_URL}/scenarios/parse-file`, {
          method: 'POST',
          body: formData,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          credentials: 'include',
        });

        if (!response.ok) {
          const dataError: ApiError = await response.json();
          return dataError.message;
        }

        const responseJson = await response.json();

        return responseJson.data as CreateScenarioPayload;
      } catch (e) {
        console.log(e);
        return 'Something went wrong. Please try again later.';
      } finally {
        set((state) => ({ scenarios: { ...state.scenarios, isLoading: false } }));
      }
    },
  },
}));
