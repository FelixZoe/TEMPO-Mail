import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { AppStateProvider } from '@/state/app-state';
import { createTempoTheme } from '@/theme';

const queryClient = new QueryClient();

export default function RootLayout() {
  const isDark = useColorScheme() === 'dark';
  const paperTheme = useMemo(() => createTempoTheme(isDark), [isDark]);
  const navigationTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: paperTheme.colors.onBackground,
        background: paperTheme.colors.background,
        card: paperTheme.colors.surface,
        text: paperTheme.colors.onBackground,
        border: 'transparent',
        notification: paperTheme.colors.error
      }
    };
  }, [isDark, paperTheme]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navigationTheme}>
        <PaperProvider theme={paperTheme}>
          <AppStateProvider>
            <Stack screenOptions={{ headerShown: false, headerShadowVisible: false, contentStyle: { backgroundColor: paperTheme.colors.background } }} />
          </AppStateProvider>
        </PaperProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
