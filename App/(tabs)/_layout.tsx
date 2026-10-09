import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTheme } from 'react-native-paper';
import { useAppState } from '@/state/app-state';

export default function TabLayout() {
  const theme = useTheme();
  const { admin } = useAppState();
  return (
    <NativeTabs
      minimizeBehavior="onScrollDown"
      tintColor={theme.colors.onBackground}
      iconColor={{ default: theme.colors.onSurfaceVariant, selected: theme.colors.onBackground }}
      labelStyle={{ default: { color: theme.colors.onSurfaceVariant, fontSize: 11 }, selected: { color: theme.colors.onBackground, fontSize: 11, fontWeight: '600' } }}
    >
      <NativeTabs.Trigger name="inbox"><NativeTabs.Trigger.Icon sf={{ default: 'tray', selected: 'tray.fill' }} /><NativeTabs.Trigger.Label>收件箱</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="admin" hidden={!admin}><NativeTabs.Trigger.Icon sf="person.2.badge.gearshape" /><NativeTabs.Trigger.Label>管理</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="search"><NativeTabs.Trigger.Icon sf="magnifyingglass" /><NativeTabs.Trigger.Label>搜索</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings" hidden><NativeTabs.Trigger.Icon sf="gearshape" /><NativeTabs.Trigger.Label>设置</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    </NativeTabs>
  );
}
