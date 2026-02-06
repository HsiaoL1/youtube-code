import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState, type PropsWithChildren } from 'react';
import { Toaster } from 'sonner';
import { useThemeStore } from '@/store/theme-store';

export function AppProviders({ children }: PropsWithChildren) {
  const [client] = useState(() => new QueryClient());
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  return (
    <QueryClientProvider client={client}>
      {children}
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
