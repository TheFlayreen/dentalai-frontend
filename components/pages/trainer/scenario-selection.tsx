'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useUserScenarioStore } from '@/store/user-scenario.store';
import React, { useEffect, useState } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, ChevronUp, LucideRefreshCw } from 'lucide-react';
import { IUserScenario } from '@/types/scenario/scenario.type';
import { Badge } from '@/components/ui/badge';

interface ScenarioSelectionProps {
  scenario: IUserScenario | null;
  setScenario: (scenario: IUserScenario | null) => void;
  setIsChatReady: (isReady: boolean) => void;
}

export default function ScenarioSelection({
  scenario,
  setScenario,
  setIsChatReady,
}: ScenarioSelectionProps) {
  const { items, isLoading, pagination, fetchScenarios } = useUserScenarioStore();

  function handleSelectScenario(scenario: IUserScenario) {
    setScenario(scenario);
  }

  const handleFetchScenarios = async (page?: number, limit?: number) => {
    try {
      const scenarios: IUserScenario[] = await fetchScenarios(page, limit);

      if (scenarios.length === 0) {
        setScenario(null);
      } else {
        setScenario(scenarios[0]);
      }
    } catch (error) {
      console.log('error: ', error);
    }
  };

  useEffect(() => {
    (async () => {
      await handleFetchScenarios();
    })();
  }, []);

  return !isLoading ? (
    <div className="flex flex-col md:flex-row gap-4 w-full max-h-full h-full relative">
      <div className="flex flex-col md:flex-row gap-4 w-full min-h-0">
        <Card className="w-full p-0 gap-0 h-full overflow-hidden">
          <CardHeader className="w-full !p-4 border-b border-border">
            <CardTitle className="w-full">Choose Your Training Scenario</CardTitle>
          </CardHeader>
          <CardContent className="p-3 !bg-white rounded-b-xl h-full overflow-y-scroll overflow-x-hidden">
            <div className="flex flex-col gap-4 h-full">
              {items.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <span>
                    No scenarios yet.
                  </span>
                </div>
              ) : (
                <>
                  {items.map((item) => (
                    <ScenarioItem
                      key={item.id}
                      scenario={item}
                      onSelect={handleSelectScenario}
                      isSelected={scenario?.id === item.id}
                    />
                  ))}
                  {pagination.totalPages > 1 && (
                    <Pagination className="pb-3">
                      <PaginationContent className="flex items-center gap-4">
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={
                              pagination.page > 1
                                ? () => handleFetchScenarios(pagination.page - 1)
                                : () => {}
                            }
                            className={cn(pagination.page > 1 && 'cursor-pointer')}
                            isActive={pagination.page > 1}
                          />
                        </PaginationItem>
                        <span>
                      {pagination.page} of {pagination.totalPages}
                    </span>
                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              pagination.page < pagination.totalPages
                                ? handleFetchScenarios(pagination.page + 1)
                                : () => {}
                            }
                            className={cn(pagination.page < pagination.totalPages && 'cursor-pointer')}
                            isActive={pagination.page < pagination.totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>
        {items.length > 0 && (
          <Card className="hidden md:flex w-full p-0 gap-0 h-full overflow-hidden md:max-w-[400px]">
            <CardHeader className="w-full !p-4 border-b border-border shrink-0">
              <CardTitle className="w-full">Scenario Overview</CardTitle>
            </CardHeader>

            <CardContent className="px-4 pt-6 !bg-white h-full overflow-scroll">
              <div className="flex flex-col gap-4 h-full w-full">
                <div className="flex flex-col gap-2">
                  <span className="text-xl font-semibold">{scenario?.currentVersion.title}</span>
                  <div className="flex flex-row gap-1 items-center">
                    <span className="text-muted-foreground text-sm">Difficulty:</span>
                    <Badge className="h-6" variant="default">
                      {scenario?.currentVersion.difficulty.title}
                    </Badge>
                  </div>
                  <div className="flex flex-row gap-1 items-center">
                    <span className="text-muted-foreground text-sm">Caller type:</span>
                    <span className="text-sm">{scenario?.currentVersion.callerType.title}</span>
                  </div>
                  <div className="flex flex-row gap-1 items-center">
                    <span className="text-muted-foreground text-sm">Category:</span>
                    <span className="text-sm">{scenario?.currentVersion.category.title}</span>
                  </div>
                  <div className="flex flex-row gap-1 items-center">
                    <span className="text-muted-foreground text-sm">Tone:</span>
                    <span className="text-sm">{scenario?.currentVersion.tone.title}</span>
                  </div>
                </div>
                <div className="pt-5 pb-3 border-t border-border">
                  <p className="text-sm whitespace-pre-wrap">
                    {scenario?.currentVersion.description}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-white border-t border-border !py-3">
              <Button className="w-full" onClick={() => setIsChatReady(true)}>
                Start Simulation
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
      {scenario && (
        <div className="md:hidden absolute bottom-0 w-full p-4 bg-white border-t border-border">
          <Button className="w-full" onClick={() => setIsChatReady(true)}>
            Start Simulation
          </Button>
        </div>
      )}
    </div>
  ) : (
    <div className="flex justify-center items-center h-full w-full">
      <LucideRefreshCw className="animate-spin size-8 text-muted-foreground" />
    </div>
  );
}

function ScenarioItem({
  scenario,
  onSelect,
  isSelected,
}: {
  scenario: IUserScenario;
  onSelect: (scenario: IUserScenario) => void;
  isSelected: boolean;
}) {
  const [isShowMore, setIsShowMore] = useState<boolean>(false);
  const {
    currentVersion: { title, category, difficulty, callerType, tone, description },
  } = scenario;

  return (
    <div className={cn('p-3 rounded-lg border border-border w-full', isSelected && 'bg-blue-50')}>
      <div className="flex flex-col md:flex-row gap-3 justify-between">
        <div className="flex flex-col gap-2">
          <span className="text-lg font-semibold">{title}</span>
          <div className="flex flex-col gap-1">
            <div className="flex flex-row gap-1 items-center">
              <span className="text-muted-foreground text-sm">Difficulty:</span>
              <Badge className="h-6" variant="default">
                {difficulty.title}
              </Badge>
            </div>
            <div className="flex flex-row gap-1 items-center">
              <span className="text-muted-foreground text-sm">Caller type:</span>
              <span className="text-sm">{callerType.title}</span>
            </div>
            <div className="flex flex-row gap-1 items-center">
              <span className="text-muted-foreground text-sm">Category:</span>
              <span className="text-sm">{category.title}</span>
            </div>
            {isShowMore && (
              <>
                <div className="flex flex-row gap-1 items-center">
                  <span className="text-muted-foreground text-sm">Tone:</span>
                  <span className="text-sm">{tone.title}</span>
                </div>
                <div className="flex flex-row gap-1">
                  <p className="text-sm whitespace-pre-wrap">
                    <span className="text-muted-foreground">Description: </span>
                    {description}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="w-full md:w-fit flex flex-row gap-2 items-center">
          <Button
            className="md:hidden w-full flex-1"
            variant="outline"
            onClick={() => setIsShowMore((prev) => !prev)}
          >
            {isShowMore ? (
              <>
                <ChevronUp />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown />
                Show More
              </>
            )}
          </Button>
          <Button
            className="w-full md:w-fit flex-1"
            disabled={isSelected}
            variant="outline"
            onClick={() => onSelect(scenario)}
          >
            {isSelected ? (
              <>
                <Check />
                Selected
              </>
            ) : (
              'Select'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
