import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { AppStateProvider } from '@/state/app-state';

const queryClient = new QueryClient();
const theme = { ...MD3LightTheme, colors: { ...MD3LightTheme.colors, primary: '#111111', secondary: '#555555' } };

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <AppStateProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </AppStateProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
