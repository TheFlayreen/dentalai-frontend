'use client';

import { DataTable } from '@/components/common/general-table';
import React, { useEffect, useMemo, useState } from 'react';
import { useUserChatSessionStore } from '@/store/user-chat-sessions.store';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { getDurationTime } from '@/lib/utils';
import { IChatSession } from '@/types/chat-sessions/chat-session.type';
import SessionEvaluation from '@/components/modules/session-evaluation';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

export default function History() {
  const { items, pagination, isLoading, getAllSessions } = useUserChatSessionStore();
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const activeRow: IChatSession | undefined = useMemo(() => {
    return items.find((item) => item.id === activeRowId);
  }, [activeRowId]);
  console.log('activeRow', activeRow);
  const formatedItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        title: item.scenarioVersion.title,
        difficulty: item.scenarioVersion.difficulty.title,
        score: item.evaluation?.payload?.scores?.performance_score || 'N/A',
        duration: getDurationTime(
          item.messages[0].createdAt,
          item.messages[item.messages.length - 1].createdAt,
        ),
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
    setActiveRowId(row.id as string);
  };

  async function handleFetchSessions(page?: number, limit?: number) {
    await getAllSessions(page, limit);
  }

  useEffect(() => {
    (async () => {
      await handleFetchSessions();
    })();
  }, []);

  return (
    <div className="">
      <DataTable
        className="w-full h-[600px]"
        data={formatedItems}
        columns={columns}
        pagination={pagination}
        onClickPagination={handleFetchSessions}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />
      <Sheet open={activeRow !== undefined && activeRow.evaluation !== null} onOpenChange={() => setActiveRowId(null)}>
        <SheetContent className="sm:max-w-[425px] max-w-[90vw] w-full overflow-y-scroll" side="right">
          <VisuallyHidden>
            <SheetTitle>Call Details</SheetTitle>
          </VisuallyHidden>
          {activeRow && (
            <SessionEvaluation session={activeRow} />
          )}
        </SheetContent>
      </Sheet>
      {/*{activeRow && (*/}
      {/*  <div className="border border-border rounded-lg p-4 max-w-[500px] w-full">*/}
      {/*    <SessionEvaluation*/}
      {/*      session={activeRow}*/}
      {/*    />*/}
      {/*  </div>*/}
      {/*)}*/}
    </div>
  );
}
