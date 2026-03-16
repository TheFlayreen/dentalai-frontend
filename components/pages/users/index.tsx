'use client';

import { DataTable } from '@/components/common/general-table';
import React, { useEffect, useMemo, useState } from 'react';
import { useChatSessionStore } from '@/store/chat-sessions.store';
import { format } from 'date-fns';
import { ColumnDef } from '@tanstack/react-table';
import { getDurationTime } from '@/lib/utils';
import SessionEvaluation from '@/components/modules/session-evaluation';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useUsersStore } from '@/store/users.store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function UsersHistory() {
  const { items, pagination, isLoading, getAllSessions } = useChatSessionStore();
  const { users, isLoading: isLoadingUsers, getUsers } = useUsersStore();

  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | undefined>(undefined);
  const formatedItems = useMemo(
    () =>
      items.map((item) => ({
        id: item.id,
        scenarioTitle: item.title,
        user: item.user.name + ' ' + item.user.surname,
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
        accessorKey: 'scenarioTitle',
        header: 'Scenario title',
        meta: { width: 'w-full', align: 'left', className: 'min-w-[200px]' },
      },
      { accessorKey: 'user', header: 'User', meta: { width: '200px', align: 'center' } },
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

  async function handleFetchSessions(page?: number, limit?: number, traineeId?: string) {
    await getAllSessions(page, limit, traineeId);
  }

  useEffect(() => {
    (async () => {
      await getUsers();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await handleFetchSessions(pagination.page, pagination.limit, selectedUser);
    })();
  }, [selectedUser]);

  return (
    <div className="">
      <Select
        disabled={isLoadingUsers}
        value={selectedUser}
        onValueChange={setSelectedUser}
      >
        <SelectTrigger id="users" className="w-full md:w-[200px] mb-4">
          <SelectValue placeholder="Select user" />
        </SelectTrigger>
        <SelectContent>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name + ' ' + user.surname}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DataTable
        className="w-full h-[600px]"
        data={formatedItems}
        columns={columns}
        pagination={pagination}
        onClickPagination={handleFetchSessions}
        isLoading={isLoading}
        onRowClick={handleRowClick}
      />
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
    </div>
  );
}
