'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  MonitorDot,
  ChartColumnIncreasing,
  ChevronsUpDown,
  LogOut,
  LucideHistory,
  BookOpenText,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/use-auth';
import { IUser } from '@/types/user.type';
import { usePathname } from 'next/navigation';
import { apiServer } from '@/lib/api-server';

const items = {
  TRAINEE: [
    {
      label: 'Front Desk Training',
      link: '/trainer',
      icon: MonitorDot,
    },
    {
      label: 'Training History',
      link: '/history',
      icon: LucideHistory,
    },
    {
      label: 'Analytics',
      link: '/analytics',
      icon: ChartColumnIncreasing,
    },
  ],
  ADMIN: [
    {
      label: 'Scenario Library',
      link: '/scenarios',
      icon: BookOpenText,
    },
    {
      label: 'Users',
      link: '/users',
      icon: Users,
    },
  ],
};

interface IAppSidebar {
  user: IUser;
}

export default function AppSidebar({ user }: IAppSidebar) {
  const pathname: string = usePathname();
  const { isMobile, state, open } = useSidebar();
  const { logout } = useAuth();

  const tabs = items[user.role.code];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="bg-blue-50/50">
        <h1>{state === 'expanded' ? 'Dental.AI' : 'D.AI'}</h1>
      </SidebarHeader>
      <SidebarContent className="justify-between bg-blue-50/50">
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {tabs.map((item, index) => (
                <SidebarMenuItem key={index}>
                  <SidebarMenuButton
                    asChild
                    size="lg"
                    isActive={pathname === item.link}
                    className="flex items-center data-[active=true]:bg-white rounded-none hover:bg-blue-100 w-full"
                  >
                    <Link
                      href={item.link}
                      className="flex items-center gap-3 px-4 group-data-[state=collapsed]:justify-center !w-full"
                    >
                      <item.icon />
                      <span className="group-data-[state=collapsed]:hidden">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="bg-blue-50/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="group-data-[state=collapsed]:hover:outline-0 group-data-[state=collapsed]:hover:bg-transparent overflow-visible hover:bg-blue-100 cursor-pointer"
                  size="lg"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={undefined} alt="CN" />
                    <AvatarFallback>{user.name[0] + user.surname[0] || 'U'}</AvatarFallback>
                  </Avatar>
                  {(open || isMobile) && (
                    <>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-heading">
                          {user.name + ' ' + user.surname}
                        </span>
                        <span className="truncate text-xs">{user.email}</span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side={isMobile ? 'bottom' : 'right'}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-base">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={undefined} alt="CN" />
                      <AvatarFallback>{user.name[0] + user.surname[0] || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate text-xs">{user.name + ' ' + user.surname}</span>
                      <span className="truncate text-xs">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                {/*<DropdownMenuSeparator />*/}
                {/*<DropdownMenuGroup>*/}
                {/*    <Link href={Route.Account}>*/}
                {/*        <DropdownMenuItem>*/}
                {/*            <Settings />*/}
                {/*            Account Details*/}
                {/*        </DropdownMenuItem>*/}
                {/*    </Link>*/}
                {/*</DropdownMenuGroup>*/}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
