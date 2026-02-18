'use client';

import { useScenarioStore } from '@/store/scenario.store';
import React, { JSX, useEffect, useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IScenarioCounts } from '@/types/scenario/scenario-counts.type';
import { Skeleton } from '@/components/ui/skeleton';
import { ScenarioDifficulty, ScenarioStatus } from '@/types/scenario/scenario.enum';
import ScenarioListItem from '@/components/pages/scenarios/scenario-list-item';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '@/components/common/general-table';
import { Button } from '@/components/ui/button';
import {
  Archive,
  ArrowUpFromLine,
  BookDashedIcon,
  Edit3Icon,
  EllipsisVertical,
  PlusIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

function getCountForTab(tabCode: string, counts: IScenarioCounts) {
  switch (tabCode) {
    case 'ALL':
      return counts?.all ?? 0;
    case 'PUBLISHED':
      return counts?.published ?? 0;
    case 'DRAFT':
      return counts?.drafts ?? 0;
    case 'ARCHIVED':
      return counts?.archived ?? 0;
    default:
      return 0;
  }
}

const tabs = [
  {
    label: 'All',
    code: 'ALL',
  },
  {
    label: 'Published',
    code: 'PUBLISHED',
  },
  {
    label: 'Drafts',
    code: 'DRAFT',
  },
  {
    label: 'Archived',
    code: 'ARCHIVED',
  },
];

export default function ScenariosList() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const { data, isLoading, fetchCounts } = useScenarioStore((state) => state.counts);
  const {
    items,
    pagination,
    isLoading: isLoadingScenarios,
    fetchScenarios,
    changeScenarioStatus,
  } = useScenarioStore((state) => state.scenarios);

  const formatedItems = useMemo(
    () =>
      items.map((item) => ({
        title: item.currentVersion.title,
        difficulty: item.currentVersion.difficulty,
        status: item.status,
        version: item.currentVersion.version,
        created: format(item.currentVersion.createdAt, 'EEE MMM dd yyyy'),
        actions: (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="ghost">
                <EllipsisVertical />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuItem className="h-8" onClick={() => router.push(`/scenarios/edit/${item.id}`)}>
                <Edit3Icon />
                Edit
              </DropdownMenuItem>
              {item.status === ScenarioStatus.DRAFT || item.status === ScenarioStatus.ARCHIVED ? (
                <DropdownMenuItem
                  className="h-8"
                  onClick={() => changeStatus(item.id, ScenarioStatus.PUBLISHED)}
                >
                  <ArrowUpFromLine />
                  Publish
                </DropdownMenuItem>
              ) : null}
              {item.status === ScenarioStatus.PUBLISHED ||
              item.status === ScenarioStatus.ARCHIVED ? (
                <DropdownMenuItem
                  className="h-8"
                  onClick={() => changeStatus(item.id, ScenarioStatus.DRAFT)}
                >
                  <BookDashedIcon />
                  Draft
                </DropdownMenuItem>
              ) : null}
              {item.status === ScenarioStatus.PUBLISHED || item.status === ScenarioStatus.DRAFT ? (
                <DropdownMenuItem
                  className="h-8"
                  onClick={() => changeStatus(item.id, ScenarioStatus.ARCHIVED)}
                >
                  <Archive />
                  Archive
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      })),
    [items],
  );

  const changeStatus = async (id: string, status: ScenarioStatus) => {
    await changeScenarioStatus(id, status);
    toast.success('Scenario status changed successfully');
  }

  const columns = useMemo<
    ColumnDef<{
      title: string;
      difficulty: ScenarioDifficulty;
      status: ScenarioStatus;
      version: number;
      created: string;
      actions: JSX.Element;
    }>[]
  >(
    () => [
      {
        accessorKey: 'title',
        header: 'Title',
        meta: { width: 'w-full', align: 'left', className: 'min-w-[200px]' },
      },
      { accessorKey: 'status', header: 'Status', meta: { width: '130px', align: 'center' } },
      { accessorKey: 'version', header: 'Version', meta: { width: '80px', align: 'center' } },
      { accessorKey: 'created', header: 'Created', meta: { width: '150px', align: 'center' } },
      {
        id: 'actions',
        header: 'Actions',
        enableSorting: false,
        meta: { width: '80px', align: 'center' },
      },
    ],
    [],
  );

  useEffect(() => {
    (async () => {
      await fetchCounts();
    })();
  }, []);

  useEffect(() => {
    (async () => {
      await fetchScenarios(activeTab === 'ALL' ? undefined : (activeTab as ScenarioStatus));
    })();
  }, [activeTab]);

  const handlePagination = async (page: number) => {
    await fetchScenarios(activeTab === 'ALL' ? undefined : (activeTab as ScenarioStatus), page);
  };

  return (
    <div className="w-full">
      <Tabs defaultValue={activeTab} value={activeTab}>
        <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-between md:items-center">
          <TabsList
            variant="line"
            className="overflow-x-scroll flex justify-start w-full md:w-fit no-scrollbar"
          >
            {tabs.map(({ label, code }) => (
              <TabsTrigger
                onClick={() => setActiveTab(code)}
                disabled={isLoading}
                key={code}
                value={code}
              >
                {label}
                {isLoading ? (
                  <Skeleton className="h-4 w-4 ml-2 animate-pulse bg-gray-200" />
                ) : (
                  <span className="ml-1">({getCountForTab(code, data)})</span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          <Link href="/scenarios/create">
            <Button className="w-full md:w-fit">
              <PlusIcon />
              Create Scenario
            </Button>
          </Link>
        </div>
        <TabsContent value={activeTab}>
          <div className="space-y-4 md:hidden">
            {isLoadingScenarios ? (
              <div className="w-full flex justify-center items-center h-[300px]">
                <span className="text-muted-foreground">
                  Loading...
                </span>
              </div>
            ) : formatedItems.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center text-sm">No data</p>
            ) : (
              <>
                {formatedItems.map((row, index) => (
                  <ScenarioListItem
                    key={`${row.title}-${row.version}-${index}`}
                    variant="card"
                    title={row.title}
                    difficulty={row.difficulty}
                    status={row.status}
                    version={row.version}
                    created={row.created}
                    actions={row.actions}
                  />
                ))}
                {pagination.totalPages > 1 && (
                  <Pagination>
                    <PaginationContent className="flex items-center gap-4">
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={
                            pagination.page > 1
                              ? () => handlePagination(pagination.page - 1)
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
                              ? handlePagination(pagination.page + 1)
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
              </>
            )}
          </div>
          <div className="hidden md:block">
            <DataTable
              className="h-[600px] min-w-[600px]"
              data={formatedItems}
              columns={columns}
              pagination={pagination}
              onClickPagination={handlePagination}
              isLoading={isLoadingScenarios}
              renderRow={(row) => (
                <ScenarioListItem
                  title={row.title}
                  difficulty={row.difficulty}
                  status={row.status}
                  version={row.version}
                  created={row.created}
                  actions={row.actions}
                />
              )}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
