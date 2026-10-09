import { Button as NativeButton, Host } from '@expo/ui/swift-ui';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { TextInput, useTheme } from 'react-native-paper';
import { sendMail } from '@/api/jmap';
import { useAppState } from '@/state/app-state';

export default function ComposeScreen() {
  const theme = useTheme();
  const { selected, password, preview } = useAppState();
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const send = async () => {
    if (preview) { Alert.alert('预览模式', '预览不会真的发送邮件。'); router.back(); return; }
    if (!selected) return;
    setSending(true);
    try { await sendMail(selected, await password(), to, subject, body); router.back(); }
    catch (reason) { Alert.alert('发送失败', reason instanceof Error ? reason.message : '未知错误'); }
    finally { setSending(false); }
  };
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.page, { backgroundColor: theme.colors.background }]}>
      <Stack.Screen options={{
        headerShown: true, presentation: 'modal', title: '新邮件', headerShadowVisible: false,
        headerLeft: () => <Host matchContents><NativeButton label="取消" onPress={() => router.back()} /></Host>,
        headerRight: () => <Host matchContents><NativeButton label={sending ? '发送中…' : '发送'} systemImage="paperplane.fill" onPress={() => void send()} /></Host>
      }} />
      <TextInput mode="flat" underlineColor="transparent" activeUnderlineColor={theme.colors.onSurfaceVariant} style={[styles.input, { backgroundColor: theme.colors.surface }]} label="收件人" value={to} onChangeText={setTo} autoCapitalize="none" keyboardType="email-address" />
      <TextInput mode="flat" underlineColor="transparent" activeUnderlineColor={theme.colors.onSurfaceVariant} style={[styles.input, { backgroundColor: theme.colors.surface }]} label="主题" value={subject} onChangeText={setSubject} />
      <TextInput mode="flat" underlineColor="transparent" activeUnderlineColor="transparent" placeholder="邮件正文" value={body} onChangeText={setBody} multiline style={[styles.body, { backgroundColor: theme.colors.surface }]} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 16, gap: 10 },
  input: { borderRadius: 16, overflow: 'hidden' },
  body: { flex: 1, alignItems: 'flex-start', borderRadius: 18, overflow: 'hidden' }
});
