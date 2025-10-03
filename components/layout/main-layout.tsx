'use client';

import { useState, useEffect, Suspense } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { TabBar } from './tab-bar';
import { PageHeader } from './page-header';
import { useSidebarCollapsed, useSetSidebarCollapsed } from '@/lib/store-client';
import { useTabNavigation } from '@/lib/use-tab-navigation';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { GlobalUploadDropzone } from '@/components/ui/global-upload-dropzone';
import { ModalManager } from '@/components/ui/modal-manager';

interface MainLayoutProps {
  children: React.ReactNode;
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const sidebarCollapsed = useSidebarCollapsed();
  const setSidebarCollapsed = useSetSidebarCollapsed();
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Initialize tab navigation
  useTabNavigation();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when sidebar is collapsed
  useEffect(() => {
    if (sidebarCollapsed && isMobile) {
      setMobileMenuOpen(false);
    }
  }, [sidebarCollapsed, isMobile]);

  return (
    <GlobalUploadDropzone>
      <div className="flex h-screen bg-background">
      {/* Mobile Menu Overlay */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        ${isMobile 
          ? `fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out ${
              mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`
          : `relative ${sidebarCollapsed ? 'w-16' : 'w-64'} transition-all duration-300`
        }
      `}>
        <Sidebar onMobileMenuClose={() => setMobileMenuOpen(false)} />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Topbar */}
        <Topbar 
          isMobile={isMobile}
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        
        {/* Tab Bar */}
        <TabBar isMobile={isMobile} />
        
        {/* Page Header */}
        <PageHeader isMobile={isMobile} />
        
        {/* Content */}
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
    
    {/* Modal Manager */}
    <ModalManager />
    </GlobalUploadDropzone>
  );
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <div className="flex h-screen">
          <div className="w-64 bg-sidebar border-r border-border" />
          <div className="flex-1 flex flex-col">
            <div className="h-16 border-b border-border" />
            <div className="flex-1 p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    }>
      <MainLayoutContent>{children}</MainLayoutContent>
    </Suspense>
  );
}
