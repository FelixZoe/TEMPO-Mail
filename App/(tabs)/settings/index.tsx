import { Stack, router } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { List, Text, useTheme } from 'react-native-paper';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { AccountMenu } from '@/components/AccountMenu';
import { useAppState } from '@/state/app-state';
import { NativeGlassButton } from '@/components/NativeControls';

export default function SettingsScreen() {
  const theme = useTheme();
  const { selected, remove, preview } = useAppState();
  const deleteLocal = () => selected && Alert.alert('移除本机账户？', selected.email, [
    { text: '取消', style: 'cancel' },
    { text: '移除', style: 'destructive', onPress: async () => { await remove(selected.id); router.replace('/'); } }
  ]);
  return (
    <View collapsable={false} style={[styles.page, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{ title: '设置', headerShadowVisible: false, headerLeft: () => <AccountMenu /> }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <Text variant="labelLarge" style={[styles.sectionLabel, { color: theme.colors.onSurfaceVariant }]}>服务</Text>
        <View style={[styles.group, { backgroundColor: theme.colors.surface }]}>
          <List.Item title="协议" description="JMAP" left={(props) => <List.Icon {...props} color={theme.colors.onSurfaceVariant} icon="server" />} />
          {preview && <><View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} /><List.Item title="当前模式" description="本地预览，不连接服务器" left={(props) => <List.Icon {...props} color={theme.colors.onSurfaceVariant} icon="eye-outline" />} /></>}
          <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
          <List.Item title="原生兼容版本" description={Updates.runtimeVersion || 'native-1'} left={(props) => <List.Icon {...props} color={theme.colors.onSurfaceVariant} icon="update" />} />
          <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
          <List.Item title="App 版本" description={Constants.expoConfig?.version || '—'} left={(props) => <List.Icon {...props} color={theme.colors.onSurfaceVariant} icon="information-outline" />} />
        </View>
        <NativeGlassButton label={preview ? '退出预览' : '移除此账户'} onPress={deleteLocal} style={styles.button} />
        <Text variant="bodySmall" style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>TypeScript 界面更新使用同一个 production OTA 通道；只有原生兼容面变化才升级 runtimeVersion。</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 36 },
  sectionLabel: { marginHorizontal: 8, marginBottom: 8 },
  group: { borderRadius: 20, overflow: 'hidden' },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 64 },
  button: { marginTop: 22 },
  note: { marginHorizontal: 8, marginTop: 12, lineHeight: 18 }
});
