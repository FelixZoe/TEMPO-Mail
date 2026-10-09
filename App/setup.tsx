import { Button as NativeButton, Host, Image as NativeImage } from '@expo/ui/swift-ui';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { HelperText, Text, TextInput, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DEFAULT_MAIL_DOMAIN, DEFAULT_MAIL_SERVER, DEFAULT_REGISTRATION_URL } from '@/config';
import { NativeGlassButton } from '@/components/NativeControls';
import { useAppState } from '@/state/app-state';

type Mode = 'welcome' | 'login' | 'custom';

export default function Setup() {
  const theme = useTheme();
  const { connect, enterPreview } = useAppState();
  const [mode, setMode] = useState<Mode>('welcome');
  const [server, setServer] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const changeMode = (next: Mode) => {
    setError('');
    setPassword('');
    setMode(next);
  };
  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await connect(mode === 'login' ? DEFAULT_MAIL_SERVER : server, email, mode === 'login' ? '' : username, password);
      router.replace('/(tabs)/inbox');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '连接失败');
    } finally {
      setBusy(false);
    }
  };
  const register = async () => {
    if (!DEFAULT_REGISTRATION_URL) {
      Alert.alert('注册尚未开放', `${DEFAULT_MAIL_DOMAIN} 服务器目前没有公开的自助注册地址。配置注册地址后，这个入口可直接通过 OTA 启用。`);
      return;
    }
    await Linking.openURL(DEFAULT_REGISTRATION_URL);
  };
  const preview = () => {
    enterPreview();
    router.replace('/(tabs)/inbox');
  };

  if (mode === 'welcome') {
    return (
      <SafeAreaView style={[styles.welcome, { backgroundColor: theme.colors.background }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View pointerEvents="none" style={[styles.glow, { backgroundColor: theme.colors.surfaceVariant }]} />
        <View style={styles.hero}>
          <Host style={styles.heroSymbol}>
            <NativeImage systemName="envelope.open.fill" size={112} color={theme.colors.onBackground} />
          </Host>
          <View style={styles.brandBlock}>
            <Text variant="displaySmall" style={styles.brand}>TEMPO Mail</Text>
            <Text variant="titleMedium" style={[styles.tagline, { color: theme.colors.onSurfaceVariant }]}>你的邮箱，由你掌控。</Text>
            <Text variant="bodyMedium" style={[styles.serverLabel, { color: theme.colors.onSurfaceVariant }]}>默认服务 · @{DEFAULT_MAIL_DOMAIN}</Text>
          </View>
        </View>
        <View style={styles.welcomeActions}>
          <NativeGlassButton label="注册 TEMPO 邮箱" systemImage="person.badge.plus" prominent wide onPress={() => void register()} />
          <NativeGlassButton label="邮箱登录" systemImage="envelope" wide onPress={() => changeMode('login')} />
          <Pressable accessibilityRole="button" hitSlop={12} onPress={() => changeMode('custom')} style={styles.textAction}>
            <Text variant="labelLarge" style={{ color: theme.colors.onBackground }}>自定义服务器</Text>
          </Pressable>
          <Pressable accessibilityRole="button" hitSlop={12} onPress={preview} style={styles.previewAction}>
            <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>不登录，预览界面</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const custom = mode === 'custom';
  return (
    <>
      <Stack.Screen options={{
        headerShown: true,
        title: custom ? '自定义服务器' : '邮箱登录',
        headerShadowVisible: false,
        headerLeft: () => <Host matchContents><NativeButton label="返回" systemImage="chevron.left" onPress={() => changeMode('welcome')} /></Host>
      }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={[styles.page, { backgroundColor: theme.colors.background }]}>
        <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.heading}>
            <Text variant="headlineSmall" style={styles.title}>{custom ? '连接你的邮箱服务' : `登录 @${DEFAULT_MAIL_DOMAIN}`}</Text>
            <Text variant="bodyMedium" style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>
              {custom ? '填写支持 JMAP 的服务地址和邮箱凭据。' : '使用你的完整邮箱地址和密码登录 TEMPO 邮箱。'}
            </Text>
          </View>
          <View style={[styles.form, { backgroundColor: theme.colors.surface }]}>
            {custom && <>
              <TextInput style={styles.input} contentStyle={styles.inputContent} mode="flat" underlineColor="transparent" activeUnderlineColor="transparent" label="服务器地址" placeholder="https://mail.example.com" value={server} onChangeText={setServer} autoCapitalize="none" />
              <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
            </>}
            <TextInput autoFocus style={styles.input} contentStyle={styles.inputContent} mode="flat" underlineColor="transparent" activeUnderlineColor="transparent" label="邮箱地址" placeholder={custom ? 'name@example.com' : `name@${DEFAULT_MAIL_DOMAIN}`} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
            {custom && <>
              <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
              <TextInput style={styles.input} contentStyle={styles.inputContent} mode="flat" underlineColor="transparent" activeUnderlineColor="transparent" label="登录用户名（可留空）" value={username} onChangeText={setUsername} autoCapitalize="none" />
            </>}
            <View style={[styles.separator, { backgroundColor: theme.colors.outlineVariant }]} />
            <TextInput style={styles.input} contentStyle={styles.inputContent} mode="flat" underlineColor="transparent" activeUnderlineColor="transparent" label="密码" value={password} onChangeText={setPassword} secureTextEntry />
          </View>
          {Boolean(error) && <HelperText type="error" visible style={styles.helper}>{error}</HelperText>}
          <View style={styles.actions}>
            <NativeGlassButton label={busy ? '正在登录…' : '登录'} systemImage="arrow.right" prominent wide isDisabled={(custom && !server) || !email || !password || busy} onPress={() => void submit()} />
          </View>
          {!custom && <Pressable accessibilityRole="button" hitSlop={12} onPress={() => changeMode('custom')} style={styles.textAction}>
            <Text variant="labelLarge" style={{ color: theme.colors.onBackground }}>使用自定义服务器</Text>
          </Pressable>}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  welcome: { flex: 1, overflow: 'hidden', paddingHorizontal: 20 },
  glow: { position: 'absolute', width: 440, height: 440, borderRadius: 220, top: -210, right: -180, opacity: 0.62 },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: 18 },
  heroSymbol: { width: 180, height: 150, alignItems: 'center', justifyContent: 'center' },
  brandBlock: { alignItems: 'center', gap: 8, marginTop: 18 },
  brand: { fontWeight: '800', letterSpacing: -1.4 },
  tagline: { fontWeight: '500' },
  serverLabel: { marginTop: 6 },
  welcomeActions: { alignItems: 'center', gap: 10, paddingBottom: 22 },
  textAction: { minHeight: 38, justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  previewAction: { minHeight: 34, justifyContent: 'center', alignItems: 'center' },
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
  actions: { marginTop: 20 }
});
