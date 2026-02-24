'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import { Check, BookOpenText } from 'lucide-react';
import { IUserScenario } from '@/types/scenario/scenario.type';

interface ScenarioSelectionProps {
  scenario: IUserScenario | null;
  setScenario: (scenario: IUserScenario) => void;
  setIsChatReady: (isReady: boolean) => void;
}

export default function ScenarioSelection({
  scenario,
  setScenario,
  setIsChatReady,
}: ScenarioSelectionProps) {
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const { items, isLoading, pagination, fetchScenarios } = useUserScenarioStore();

  function handleSelectScenario(scenario: IUserScenario) {
    setScenario(scenario);
    setIsOpenDialog(false);
  }

  useEffect(() => {
    (async () => {
      await fetchScenarios();
    })();
  }, []);

  return (
    <div className="flex flex-col md:flex-row gap-4 w-full max-h-full h-full min-h-0 overflow-hidden">
      <div className="flex flex-col gap-4 w-full flex-1 min-h-0 overflow-hidden">
        <Card className="w-full p-0 gap-0 shrink-0">
          <CardHeader className="w-full !p-4 border-b border-border">
            <CardTitle className="w-full">Choose a Scenario</CardTitle>
          </CardHeader>
          <CardContent className="py-6 !bg-white rounded-b-xl">
            <div className="flex flex-col items-center gap-4">
              <p className="text-center">
                Let's start by choosing a simulation scenario to practice
              </p>
              <Dialog open={isOpenDialog} onOpenChange={setIsOpenDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant={scenario ? 'outline' : 'default'}
                    className="w-full md:w-[300px]"
                  >
                    {scenario ? 'Change scenario' : 'Select a scenario'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogTitle>Choose a Training Scenario</DialogTitle>
                  <div className="flex flex-col gap-3">
                    {isLoading ? (
                      <div className="w-full flex justify-center items-center h-[300px]">
                        <span className="text-muted-foreground">Loading...</span>
                      </div>
                    ) : (
                      items.map((item) => (
                        <Button
                          key={item.id}
                          variant="outline"
                          className="justify-between"
                          onClick={() => handleSelectScenario(item)}
                          disabled={scenario?.id === item.id}
                        >
                          {item.currentVersion.title}
                          {item.id === scenario?.id && <Check className="size-4 mr-2" />}
                        </Button>
                      ))
                    )}
                  </div>
                  {pagination.totalPages > 1 && (
                    <Pagination>
                      <PaginationContent className="flex items-center gap-4">
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={
                              pagination.page > 1
                                ? () => fetchScenarios(pagination.page - 1)
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
                                ? fetchScenarios(pagination.page + 1)
                                : () => {}
                            }
                            className={cn(
                              pagination.page < pagination.totalPages && 'cursor-pointer',
                            )}
                            isActive={pagination.page < pagination.totalPages}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full p-0 gap-0 flex flex-col flex-1 min-h-0">
          <CardHeader className="w-full !p-4 border-b border-border shrink-0">
            <CardTitle className="w-full">Scenario Preview</CardTitle>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col min-h-0 py-6 !bg-white rounded-b-xl overflow-hidden">
            {scenario ? (
              <div className="flex-1 flex flex-col gap-4 min-h-0 max-h-[50vh] overflow-y-auto">
                <span className="text-lg font-semibold text-center shrink-0">
                  {scenario.currentVersion.title}
                </span>
                <p className="min-w-0 whitespace-pre-wrap">{scenario.currentVersion.description}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-center py-10 h-full">
                <BookOpenText strokeWidth={1.5} className="size-15 text-muted-foreground" />
                <p className="font-medium text-lg text-muted-foreground">
                  Select a scenario to see what this simulation will be about.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card className="w-full md:max-w-[400px] p-0 gap-0 flex flex-col min-h-0">
        <CardHeader className="w-full !p-4 border-b border-border shrink-0">
          <CardTitle className="w-full">Training Options</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col justify-between gap-5 h-full min-h-0 py-6 !bg-white rounded-b-xl">
          <div className="flex flex-row gap-1">
            <span className="font-semibold">Difficulty:</span>
            <p>Set by your trainer</p>
          </div>
          <div className="flex flex-col gap-2">
            <Button disabled={!scenario} onClick={() => setIsChatReady(true)}>
              Start Simulation
            </Button>
            <span className="text-center text-muted-foreground">Select a scenario to start</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
