'use client';

import { useState } from 'react';
import Image from 'next/image';
import { signOut, useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { useWindowSize } from 'usehooks-ts';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button, cn } from '@turbo-super/ui';
import { ChevronDownIcon, LoaderIcon, UserIcon } from '../common/icons';
import { guestRegex } from '@/lib/constants';
import { toast } from '../common/toast';

interface HeaderUserNavProps {
  className?: string;
}

export function HeaderUserNav({ className }: HeaderUserNavProps) {
  const router = useRouter();
  const { data, status } = useSession();
  const { setTheme, theme } = useTheme();
  const [open, setOpen] = useState(false);
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth < 768;

  const user = data?.user;
  const isGuest = guestRegex.test(user?.email ?? '');

  if (status === 'loading') {
    return (
      <div className={className}>
        <Button
          variant="outline"
          className="flex items-center justify-between gap-2 h-[34px] px-2"
        >
          <div className="size-6 bg-zinc-500/30 rounded-full animate-pulse" />
          {!isMobile && (
            <span className="bg-zinc-500/30 text-transparent rounded-md animate-pulse">
              Loading...
            </span>
          )}
          <div className="animate-spin text-zinc-500">
            <LoaderIcon />
          </div>
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            data-testid="header-user-nav-button"
            variant="outline"
            className={cn(
              'flex items-center justify-between gap-2 h-[34px]',
              isMobile ? 'px-2 w-auto' : 'px-2',
            )}
          >
            {user?.email ? (
              <Image
                src={`https://avatar.vercel.sh/${user.email}`}
                alt={user.email ?? 'User Avatar'}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <UserIcon size={24} />
            )}
            {!isMobile && (
              <span className="max-w-[100px] truncate">
                {isGuest ? 'Guest' : user?.email}
              </span>
            )}
            {!isMobile && <ChevronDownIcon />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          {isMobile && (
            <>
              <DropdownMenuItem disabled className="opacity-50">
                {isGuest ? 'Guest' : user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {`Toggle ${theme === 'light' ? 'dark' : 'light'} mode`}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => {
              if (status !== 'authenticated') {
                toast({
                  type: 'error',
                  description:
                    'Checking authentication status, please try again!',
                });
                return;
              }

              if (isGuest) {
                // Redirect to auto-login with force_logout parameter
                // This will force logout from guest session in auto-login
                router.push('/auto-login?force_logout=true');
              } else {
                // Logout and redirect to guest mode instead of auto-login
                signOut({
                  redirect: true,
                  callbackUrl: '/api/auth/guest?redirectUrl=/',
                });
              }
            }}
          >
            {isGuest ? 'Log in' : 'Log out'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
