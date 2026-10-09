import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useAppState } from '@/state/app-state';

export default function TabLayout() {
  const { admin } = useAppState();
  return (
    <NativeTabs minimizeBehavior="onScrollDown">
      <NativeTabs.Trigger name="inbox"><NativeTabs.Trigger.Icon sf={{ default: 'tray', selected: 'tray.fill' }} /><NativeTabs.Trigger.Label>收件箱</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="starred"><NativeTabs.Trigger.Icon sf={{ default: 'star', selected: 'star.fill' }} /><NativeTabs.Trigger.Label>星标</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="sent"><NativeTabs.Trigger.Icon sf={{ default: 'paperplane', selected: 'paperplane.fill' }} /><NativeTabs.Trigger.Label>已发送</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="admin" hidden={!admin}><NativeTabs.Trigger.Icon sf="person.2.badge.gearshape" /><NativeTabs.Trigger.Label>管理</NativeTabs.Trigger.Label></NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings"><NativeTabs.Trigger.Icon sf={{ default: 'gearshape', selected: 'gearshape.fill' }} /><NativeTabs.Trigger.Label>设置</NativeTabs.Trigger.Label></NativeTabs.Trigger>
    </NativeTabs>
  );
}
