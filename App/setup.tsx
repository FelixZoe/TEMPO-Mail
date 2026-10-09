import { useState } from 'react';
import { router, Stack } from 'expo-router';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { HelperText, Surface, Text, TextInput } from 'react-native-paper';
import { useAppState } from '@/state/app-state';
import { NativeGlassButton } from '@/components/NativeControls';

export default function Setup() {
  const { connect, enterPreview } = useAppState();
  const [server, setServer] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const submit = async () => {
    setBusy(true); setError('');
    try { await connect(server, email, username, password); router.replace('/(tabs)/inbox'); }
    catch (reason) { setError(reason instanceof Error ? reason.message : '连接失败'); }
    finally { setBusy(false); }
  };
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: '配置服务' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.page}>
        <Surface style={styles.form} elevation={0}>
          <Text variant="headlineMedium">连接自托管邮箱</Text>
          <Text variant="bodyMedium">服务验证成功后才会进入客户端。</Text>
          <TextInput mode="outlined" label="服务器地址" placeholder="https://mail.example.com" value={server} onChangeText={setServer} autoCapitalize="none" />
          <TextInput mode="outlined" label="邮箱地址" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput mode="outlined" label="登录用户名（可留空）" value={username} onChangeText={setUsername} autoCapitalize="none" />
          <TextInput mode="outlined" label="密码" value={password} onChangeText={setPassword} secureTextEntry />
          <HelperText type="error" visible={Boolean(error)}>{error}</HelperText>
          <NativeGlassButton label={busy ? '正在验证…' : '验证并进入'} prominent isDisabled={!server || !email || !password || busy} onPress={() => void submit()} />
          <NativeGlassButton label="不登录，预览界面" isDisabled={busy} onPress={() => { enterPreview(); router.replace('/(tabs)/inbox'); }} />
          <Text variant="bodySmall" style={styles.previewNote}>预览只使用本地示例数据，不保存账户，也不会请求网络权限。</Text>
        </Surface>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({ page: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f5f5f5' }, form: { gap: 14, padding: 20, borderRadius: 24 }, previewNote: { color: '#666', textAlign: 'center' } });
