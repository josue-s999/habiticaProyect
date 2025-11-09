
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, User, Menu as MenuIcon, Settings, Trophy, BarChart, Users, Image, Shield, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarHeader, SidebarNavContent } from './Sidebar';

const navItems = [
  { href: '/home', label: 'Inicio', icon: Home },
  { href: '/ranks', label: 'Rangos', icon: Trophy },
  { href: '/achievements', label: 'Logros', icon: Award },
  { href: '/leaderboard', label: 'Ranking', icon: Users },
];

export function BottomNavbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
      <div className="container mx-auto grid h-16 max-w-lg grid-cols-5 items-center px-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 w-full text-sm font-medium transition-colors h-full rounded-md',
                isActive ? 'text-primary bg-primary/15' : 'text-muted-foreground hover:text-primary'
              )}
            >
              <item.icon className="h-6 w-6" />
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
        <Sheet>
          <SheetTrigger asChild>
            <div className="flex flex-col items-center justify-center gap-1 w-full text-sm font-medium transition-colors text-muted-foreground hover:text-primary h-full cursor-pointer">
              <MenuIcon className="h-6 w-6" />
              <span className="sr-only">Menú</span>
            </div>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72 flex flex-col">
            <SidebarHeader />
            <SidebarNavContent />
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
