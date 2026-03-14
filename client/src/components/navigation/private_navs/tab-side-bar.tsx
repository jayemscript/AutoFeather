'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Settings, HelpCircle, Search } from 'lucide-react';
import { useAuthCheck } from '@/hooks/use-auth-check.hooks';
import Link from 'next/link';
import Image from 'next/image';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import SidebarSkeleton from '@/components/splash/skeleton-pre-built/sidebar-skeleton';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import SideBarProfile from './side-bar-profile';
import SearchDialog from '@/components/customs/search-dialog';
import {
  ResearcherMenuItems,
  AdministrativeMenuItems,
  PoultryOperatorMenutItems,
  MonitoringManagerMenutItems,
} from './tab-side-bar.menu';

interface MenuItems {
  path: string;
  icon: React.ReactNode;
  label: string;
  role: string[];
}

interface TabSideBarProps {
  isOpen: boolean;
  onClose?: () => void;
}

interface TooltipWrapperProps {
  children: React.ReactNode;
  content: string;
  isOpen: boolean;
}

const TooltipWrapper: React.FC<TooltipWrapperProps> = ({
  children,
  content,
  isOpen,
}) => {
  if (isOpen) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side="right">
        <p>{content}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default function TabSideBar({ isOpen, onClose }: TabSideBarProps) {
  const [mounted, setMounted] = useState(false);
  const { user } = useAuthCheck();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user) return;

    const excludedPaths = ['/admin', '/report'];
    if (excludedPaths.some((path) => pathname.startsWith(path))) return;

    if (!user.access.some((p) => pathname.startsWith(p))) {
      router.replace('/unauthorized');
    }
  }, [user, pathname, router]);

  const hasAccess = (roles: string[]) => {
    if (!user?.roleId.role) return false;
    if (roles.length === 0) return true;
    return roles.includes(user.roleId.role);
  };

  const getMenuItems = (): MenuItems[] => {
    if (!user?.roleId.role) return [];
    const role = user.roleId.role;

    if (['Administrator', 'Moderator', 'User'].includes(role))
      return AdministrativeMenuItems;
    if (role === 'Researcher') return ResearcherMenuItems;
    if (role === 'Poultry-Operator') return PoultryOperatorMenutItems;
    if (role === 'Monitoring-Manager') return MonitoringManagerMenutItems;

    return [];
  };

  const menuItems = getMenuItems();

  const renderMenuItem = (item: MenuItems) => {
    const isActive = pathname === item.path;
    return (
      <TooltipWrapper content={item.label} isOpen={true}>
        <Link
          href={item.path}
          className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
            isActive
              ? 'text-black bg-background dark:bg-primary dark:text-gray-700 shadow-sm font-medium'
              : 'text-black dark:text-black bg-white hover:bg-zinc-300 hover:text-black dark:hover:bg-zinc-200 dark:hover:text-black'
          }`}
        >
          {/* Icon container — fixed width keeps labels aligned */}
          <span
            className={`flex items-center justify-center w-7 h-7 rounded-md flex-shrink-0 transition-colors duration-200 ${
              isActive
                ? 'bg-primary/10 dark:bg-gray-700/10'
                : 'bg-zinc-100 dark:bg-zinc-200 group-hover:bg-zinc-200 dark:group-hover:bg-zinc-300'
            }`}
          >
            {item.icon}
          </span>

          {/* Active indicator bar on the left edge */}
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary dark:bg-gray-700 rounded-r-full" />
          )}

          <span className="text-[0.8em] truncate">{item.label}</span>
        </Link>
      </TooltipWrapper>
    );
  };

  const renderBottomButton = (
    icon: React.ReactElement,
    label: string,
    onClick: () => void,
  ) => (
    <Button
      variant="default"
      className="text-white bg-transparent hover:bg-neutral-700 cursor-pointer w-full justify-start px-3 py-2 rounded-md transition-colors duration-200 gap-3"
      onClick={onClick}
    >
      <span className="flex items-center justify-center w-7 h-7 rounded-md bg-white/10 flex-shrink-0">
        {React.cloneElement(icon, { className: 'h-4 w-4' } as any)}
      </span>
      <span className="text-[0.8em]">{label}</span>
    </Button>
  );

  if (!isOpen) return null;

  return (
    <>
      <TooltipProvider>
        {!mounted ? (
          <SidebarSkeleton isOpen={true} />
        ) : (
          <div
            ref={sidebarRef}
            className="flex flex-col w-64 h-full bg-primary dark:bg-background text-accent dark:text-white shadow-lg"
          >
            {/* ── Header ── */}
            <div
              className="flex items-center gap-2.5 px-5 py-5 cursor-pointer border-b border-white/10 dark:border-white/5"
              onClick={() => router.push('/')}
            >
              {/* Logo mark */}
              <span className="flex items-center justify-center rounded-md overflow-hidden shrink-0">
                <Image
                  src="/images/main_logo1.png"
                  alt="AutoFeather logo"
                  width={20}
                  height={20}
                  className="object-contain w-full h-full"
                />
              </span>
              <span className="font-bold text-[0.75em] tracking-wide uppercase text-white dark:text-white">
                AutoFeather
              </span>
            </div>

            {/* ── Navigation label ── */}
            <div className="px-5 pt-5 pb-1">
              <span className="text-[0.65em] font-semibold uppercase tracking-widest text-white/50 dark:text-white/40">
                Navigation
              </span>
            </div>

            {/* ── Menu Items ── */}
            <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
              {menuItems.map(
                (item) =>
                  hasAccess(item.role) && (
                    <div key={item.path} className="relative">
                      {renderMenuItem(item)}
                    </div>
                  ),
              )}
            </nav>

            {/* ── Bottom Section ── */}
            <div className="px-3 pb-4 pt-2 flex flex-col gap-1">
              <Separator className="mb-3 opacity-20" />

              {renderBottomButton(<HelpCircle />, 'Get Help', () =>
                router.push('/help'),
              )}

              <div className="mt-2 px-1">
                <SideBarProfile isOpen={true} />
              </div>
            </div>
          </div>
        )}
      </TooltipProvider>

      {searchOpen && (
        <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      )}
    </>
  );
}
