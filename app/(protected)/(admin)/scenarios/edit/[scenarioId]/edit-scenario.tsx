'use client'

import { ScenarioForm } from '@/components/pages/scenarios/scenario-form';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IScenario } from '@/types/scenario/scenario.type';
import { apiClient } from '@/lib/api-client';
import { useScenarioStore } from '@/store/scenario.store';
import { toast } from 'sonner';

export default function EditScenario() {
  const router = useRouter();
  const {scenarioId} = useParams();
  const { items } = useScenarioStore((state) => state.scenarios);
  const [scenario, setScenario] = useState<IScenario | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchScenario = async () => {
      try {
        const scenario: IScenario | undefined = await apiClient.get<IScenario>(`/scenarios/find-by-id/${scenarioId}`);

        if (!scenario) {
          toast.error('Scenario not found.');
          router.replace('/scenarios');
        }

        setScenario(scenario);
      } catch(e) {
        toast.error('Scenario not found.');
        router.replace('/scenarios');
      } finally {
        setIsLoading(false);
      }
    }

    const currentScenario: IScenario | undefined = items.find(scenario => scenario.id === scenarioId);

    if (currentScenario) {
      setScenario(currentScenario);
      setIsLoading(false);
    } else {
      fetchScenario();
    }
  }, [scenarioId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <ScenarioForm isCreate={false} scenario={scenario}/>
  )
}