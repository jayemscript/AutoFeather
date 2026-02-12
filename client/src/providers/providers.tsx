// src/providers/providers.tsx
'use client';

import { ThemeProvider } from '@/providers/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import SplashOverlay from '@/components/splash/splash-overlay';
import { SocketProvider } from '@/providers/socket-provider';
import { ReactNode } from 'react';
import ToastNotificationHandler from '@/components/customs/toast-notification-handler';

import {
  QueryClient,
  QueryClientProvider,
  type QueryClientConfig,
} from '@tanstack/react-query';

export const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <SocketProvider>
          <div
            style={{
              minHeight: '100vh',
              backgroundImage: "url('/images/bg.jpg')",
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
            }}
          >
            {children}
          </div>

          <ToastNotificationHandler />
          <SplashOverlay />
          <Toaster position="top-right" />
        </SocketProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
