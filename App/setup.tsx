import { useState } from 'react';
import { router, Stack } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { useAppState } from '@/state/app-state';
import { NativeGlassButton } from '@/components/NativeControls';

export default function Setup() {
  const theme = useTheme();
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
      <Stack.Screen options={{ headerShown: true, title: '配置服务', headerShadowVisible: false }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.page, { backgroundColor: theme.colors.background }]}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <Text variant="headlineMedium" style={styles.title}>连接自托管邮箱</Text>
          <Text variant="bodyLarge" style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>先验证你的服务地址。管理员账户会自动显示管理导航，普通账户只保留收发邮件。</Text>
          <TextInput style={[styles.input, { backgroundColor: theme.colors.surface }]} mode="flat" underlineColor="transparent" activeUnderlineColor={theme.colors.onSurfaceVariant} label="服务器地址" placeholder="https://mail.example.com" value={server} onChangeText={setServer} autoCapitalize="none" />
          <TextInput style={[styles.input, { backgroundColor: theme.colors.surface }]} mode="flat" underlineColor="transparent" activeUnderlineColor={theme.colors.onSurfaceVariant} label="邮箱地址" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
          <TextInput style={[styles.input, { backgroundColor: theme.colors.surface }]} mode="flat" underlineColor="transparent" activeUnderlineColor={theme.colors.onSurfaceVariant} label="登录用户名（可留空）" value={username} onChangeText={setUsername} autoCapitalize="none" />
          <TextInput style={[styles.input, { backgroundColor: theme.colors.surface }]} mode="flat" underlineColor="transparent" activeUnderlineColor={theme.colors.onSurfaceVariant} label="密码" value={password} onChangeText={setPassword} secureTextEntry />
          <HelperText type="error" visible={Boolean(error)} style={styles.helper}>{error || ' '}</HelperText>
          <NativeGlassButton label={busy ? '正在验证…' : '验证并进入'} prominent isDisabled={!server || !email || !password || busy} onPress={() => void submit()} />
          <NativeGlassButton label="不登录，预览界面" isDisabled={busy} onPress={() => { enterPreview(); router.replace('/(tabs)/inbox'); }} />
          <Text variant="bodySmall" style={[styles.previewNote, { color: theme.colors.onSurfaceVariant }]}>预览只使用本地示例数据，不保存账户，也不会请求网络权限。</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32, gap: 12 },
  title: { fontWeight: '700', letterSpacing: -0.5 },
  intro: { lineHeight: 23, marginBottom: 10 },
  input: { borderRadius: 16, overflow: 'hidden' },
  helper: { minHeight: 24 },
  previewNote: { textAlign: 'center', lineHeight: 18, marginTop: 2, paddingHorizontal: 8 }
});
