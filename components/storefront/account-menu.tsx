'use client';

import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import {
  ChevronDown,
  Package,
  Repeat,
  ListOrdered,
  Building2,
  MapPin,
  Wallet,
  LogOut,
  User as UserIcon,
  FileText,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export function AccountMenu() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();

  if (!isLoaded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        disabled
        aria-busy="true"
        aria-label="Loading account"
        className="gap-1 px-2 text-foreground/40"
      >
        <span className="h-3.5 w-3.5 animate-pulse rounded-full bg-foreground/20" />
        <span className="text-sm font-semibold">Account</span>
      </Button>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/sign-in">Sign in</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>
    );
  }

  const display = user?.firstName || user?.fullName || user?.username || 'Account';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 px-2">
          <span className="text-xs text-muted-foreground">Hi,</span>
          <span className="max-w-[7rem] truncate text-sm font-semibold">{display}</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end">
        <DropdownMenuLabel className="font-normal">
          <p className="text-sm font-semibold leading-tight">{user?.fullName || display}</p>
          <p className="text-xs text-muted-foreground">
            {user?.emailAddresses[0]?.emailAddress}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/orders">
            <Package className="mr-2 h-4 w-4" />
            Orders
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/orders">
            <Repeat className="mr-2 h-4 w-4" />
            Reorder
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/quotes">
            <FileText className="mr-2 h-4 w-4" />
            My Quotes
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/saved-lists">
            <ListOrdered className="mr-2 h-4 w-4" />
            Saved lists
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/account/business-details">
            <Building2 className="mr-2 h-4 w-4" />
            Business details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserIcon className="mr-2 h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <MapPin className="mr-2 h-4 w-4" />
          Addresses
          <span className="ml-auto text-[10px] uppercase text-muted-foreground">soon</span>
        </DropdownMenuItem>
        <DropdownMenuItem disabled>
          <Wallet className="mr-2 h-4 w-4" />
          Wallet
          <span className="ml-auto text-[10px] uppercase text-muted-foreground">soon</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-rose-600 focus:text-rose-600"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
