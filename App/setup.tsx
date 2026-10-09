import { useState } from 'react';
import { router, Stack } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
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
        <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.heading}>
            <Text variant="headlineSmall" style={styles.title}>连接自托管邮箱</Text>
            <Text variant="bodyMedium" style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>验证服务地址后即可收发邮件；管理员账户会自动出现管理导航。</Text>
          </View>
          <View style={[styles.form, { backgroundColor: theme.colors.surface }]}>
            <TextInput style={styles.input} contentStyle={styles.inputContent} mode="flat" underlineColor="transparent" activeUnderlineColor="transparent" label="服务器地址" placeholder="https://mail.example.com" value={server} onChangeText={setServer} autoCapitalize="none" />
            <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
            <TextInput style={styles.input} contentStyle={styles.inputContent} mode="flat" underlineColor="transparent" activeUnderlineColor="transparent" label="邮箱地址" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
            <TextInput style={styles.input} contentStyle={styles.inputContent} mode="flat" underlineColor="transparent" activeUnderlineColor="transparent" label="登录用户名（可留空）" value={username} onChangeText={setUsername} autoCapitalize="none" />
            <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
            <TextInput style={styles.input} contentStyle={styles.inputContent} mode="flat" underlineColor="transparent" activeUnderlineColor="transparent" label="密码" value={password} onChangeText={setPassword} secureTextEntry />
          </View>
          {Boolean(error) && <HelperText type="error" visible style={styles.helper}>{error}</HelperText>}
          <View style={styles.actions}>
            <NativeGlassButton label={busy ? '正在验证…' : '验证并进入'} prominent isDisabled={!server || !email || !password || busy} onPress={() => void submit()} />
            <NativeGlassButton label="不登录，预览界面" isDisabled={busy} onPress={() => { enterPreview(); router.replace('/(tabs)/inbox'); }} />
          </View>
          <Text variant="bodySmall" style={[styles.previewNote, { color: theme.colors.onSurfaceVariant }]}>预览只使用本地示例数据，不保存账户，也不会请求网络权限。</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 36 },
  heading: { gap: 8, marginHorizontal: 4, marginBottom: 22 },
  title: { fontWeight: '700', letterSpacing: -0.5 },
  intro: { lineHeight: 21 },
  form: { borderRadius: 20, overflow: 'hidden' },
  input: { height: 60, backgroundColor: 'transparent' },
  inputContent: { minHeight: 60 },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: 16 },
  helper: { marginTop: 4 },
  actions: { gap: 8, marginTop: 20 },
  previewNote: { textAlign: 'center', lineHeight: 18, marginTop: 12, paddingHorizontal: 12 }
});
