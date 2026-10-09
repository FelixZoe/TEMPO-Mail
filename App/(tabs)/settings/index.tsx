import { Stack, router } from 'expo-router';
import { Alert, StyleSheet, View } from 'react-native';
import { Divider, List, Text } from 'react-native-paper';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import { AccountMenu } from '@/components/AccountMenu';
import { useAppState } from '@/state/app-state';
import { NativeGlassButton } from '@/components/NativeControls';

export default function SettingsScreen() {
  const { selected, remove, preview } = useAppState();
  const deleteLocal = () => selected && Alert.alert('移除本机账户？', selected.email, [
    { text: '取消', style: 'cancel' },
    { text: '移除', style: 'destructive', onPress: async () => { await remove(selected.id); router.replace('/'); } }
  ]);
  return (
    <View style={styles.page}>
      <Stack.Screen options={{ title: '设置', headerLeft: () => <AccountMenu /> }} />
      <List.Section>
        <List.Subheader>服务</List.Subheader>
        <List.Item title="协议" description="JMAP" left={(props) => <List.Icon {...props} icon="server" />} />
        {preview && <List.Item title="当前模式" description="本地预览，不连接服务器" left={(props) => <List.Icon {...props} icon="eye-outline" />} />}
        <Divider />
        <List.Item title="原生兼容版本" description={Updates.runtimeVersion || 'native-1'} left={(props) => <List.Icon {...props} icon="update" />} />
        <Divider />
        <List.Item title="App 版本" description={Constants.expoConfig?.version || '—'} left={(props) => <List.Icon {...props} icon="information-outline" />} />
      </List.Section>
      <NativeGlassButton label={preview ? '退出预览' : '移除此账户'} onPress={deleteLocal} style={styles.button} />
      <Text variant="bodySmall" style={styles.note}>TypeScript 界面更新使用同一个 production OTA 通道；只有原生兼容面变化才升级 runtimeVersion。</Text>
    </View>
  );
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: '#fff' }, button: { margin: 16 }, note: { marginHorizontal: 20, color: '#666' } });
