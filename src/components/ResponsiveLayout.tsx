import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
}

export const ResponsiveLayout = ({ children, sidebar, header }: ResponsiveLayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      {header && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            {header}
          </div>
        </header>
      )}

      <div className="flex flex-1">
        {/* Sidebar for desktop */}
        {sidebar && !isMobile && (
          <aside className="sticky top-0 hidden w-64 shrink-0 md:block">
            <div className="h-screen border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              {sidebar}
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <div className="container max-w-screen-2xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {sidebar && isMobile && (
        <nav className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden">
          <div className="flex h-16 items-center justify-around px-4">
            {sidebar}
          </div>
        </nav>
      )}
    </div>
  );
};