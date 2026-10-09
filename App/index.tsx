import { Redirect } from 'expo-router';
import { ActivityIndicator, useTheme } from 'react-native-paper';
import { View } from 'react-native';
import { useAppState } from '@/state/app-state';

export default function Index() {
  const theme = useTheme();
  const { ready, selected } = useAppState();
  if (!ready) return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: theme.colors.background }}><ActivityIndicator /></View>;
  return <Redirect href={selected ? '/(tabs)/inbox' : '/setup'} />;
}
