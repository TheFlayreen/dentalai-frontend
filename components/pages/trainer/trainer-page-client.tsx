'use client';

import ScenarioSelection from '@/components/pages/trainer/scenario-selection';
import { useState } from 'react';
import { IUserScenario } from '@/types/scenario/scenario.type';
import ChatAi from '@/components/pages/trainer/chat-ai';

export default function TrainerPageClient() {
  const [selectedScenario, setSelectedScenario] = useState<IUserScenario | null>(null);
  const [isChatReady, setIsChatReady] = useState<boolean>(false);

  return (
    <div className="h-[calc(100vh-100px)]">
      {isChatReady && selectedScenario ? (
        <ChatAi
          scenarioId={selectedScenario.id}
          scenarioTitle={selectedScenario.currentVersion.title}
          setIsChatReady={setIsChatReady}
        />
      ) : (
        <ScenarioSelection
          scenario={selectedScenario}
          setScenario={setSelectedScenario}
          setIsChatReady={setIsChatReady}
        />
      )}
    </div>
  )
}
