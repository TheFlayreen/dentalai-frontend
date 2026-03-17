'use client';

import { useUsersStore } from '@/store/users.store';
import React, { useEffect, useMemo, useState } from 'react';
import { IProfileStatistic } from '@/types/users/profile-statistic.type';
import { useChatSessionStore } from '@/store/chat-sessions.store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getDurationTime } from '@/lib/utils';
import { format } from 'date-fns';
import { BarChart3, CheckCircle2, Target, MessageSquare } from 'lucide-react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/general-table';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import SessionEvaluation from '@/components/modules/session-evaluation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import ScoreBar from '@/components/common/score-bar';

export default function Analytics() {
  const { getProfileStats } = useUsersStore();
  const { items, pagination, getAllSessions, isLoading } = useChatSessionStore();
  const [isLoadingStats, setLoadingStats] = useState<boolean>(true);
  const [stats, setStats] = useState<IProfileStatistic | null>(null);
  const [activeRowId, setActiveRowId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoadingStats(true);
      const data: IProfileStatistic | null = await getProfileStats();
      setStats(data ?? null);
      setLoadingStats(false);
    })();
  }, []);

  useEffect(() => {
    getAllSessions(1, 3);
  }, []);

  const formatedItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        title: item.title,
        difficulty: item.difficulty.title,
        score: item.performance_score || 'N/A',
        duration: getDurationTime(item.duration),
        date: format(item.createdAt, 'EEE MMM dd yyyy'),
      })),
    [items],
  );

  const columns = useMemo<
    ColumnDef<{
      title: string;
      difficulty: string;
      score: string | number;
      date: string;
      duration: string;
    }>[]
  >(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        meta: { width: 'w-full', align: 'left', className: 'min-w-[200px]' },
      },
      { accessorKey: 'difficulty', header: 'Difficulty', meta: { width: '80px', align: 'center' } },
      { accessorKey: 'score', header: 'Score', meta: { width: '80px', align: 'center' } },
      { accessorKey: 'duration', header: 'Duration', meta: { width: '150px', align: 'center' } },
      { accessorKey: 'date', header: 'Date', meta: { width: '150px', align: 'center' } },
    ],
    [],
  );

  const handleRowClick = (row: any) => {
    if (row.score === 'N/A') return;
    setActiveRowId(row.id as string);
  };

  return (
    <div className="flex flex-col gap-6 p-4">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoadingStats ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-5 w-24 bg-muted rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : stats ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total sessions
                </CardTitle>
                <MessageSquare className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-semibold">{stats.sessionsCounts.total}</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
                <CheckCircle2 className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-semibold">{stats.sessionsCounts.completed}</span>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg performance
                </CardTitle>
                <Target className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-semibold">{stats.avgPerformanceScore}%</span>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card className="sm:col-span-3">
            <CardContent className="py-8 text-center text-muted-foreground">
              No statistics available yet.
            </CardContent>
          </Card>
        )}
      </section>

      {stats && stats.categories.length > 0 && (
        <Card className="p-0 gap-0">
          <CardHeader className="w-full !p-4 border-b border-border">
            <CardTitle className="w-full flex flex-row items-center gap-2">
              <BarChart3 className="size-5" />
              Average performance by category
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 py-5 !bg-white rounded-b-xl h-full">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stats.categories.map((cat, i) => (
                <div
                  key={i}
                  className="flex flex-col rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  <span className="text-sm text-muted-foreground truncate">{cat.category}</span>
                  {/*<span className="text-sm font-semibold tabular-nums">{cat.avg}/10</span>*/}
                  <ScoreBar value={cat.avg || 0} max={10} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="p-0 gap-0">
        <CardHeader className="w-full !p-4 border-b border-border">
          <CardTitle className="w-full flex flex-row items-center gap-2">Recent sessions</CardTitle>
        </CardHeader>
        <CardContent className="px-3 py-5 !bg-white rounded-b-xl h-full">
          <div className="flex flex-col items-center gap-4">
            <DataTable
              className="w-full h-fit"
              data={formatedItems}
              columns={columns}
              pagination={pagination}
              onClickPagination={async () => {}}
              isLoading={isLoading}
              onRowClick={handleRowClick}
            />
            <Link href="/history" className="text-sm text-primary underline">
              <Button size="lg" className="w-full md:w-fit">
                View all sessions
              </Button>
            </Link>
          </div>
          <Dialog open={!!activeRowId} onOpenChange={() => setActiveRowId(null)}>
            <DialogContent className="h-[90vh] w-[80vw] !max-w-[80vw] overflow-y-scroll p-4">
              <VisuallyHidden>
                <DialogTitle>Call Details</DialogTitle>
              </VisuallyHidden>
              {activeRowId && (
                <SessionEvaluation
                  sessionId={activeRowId}
                  duration={items.find((item) => item.id === activeRowId)?.duration || 0}
                />
              )}
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
