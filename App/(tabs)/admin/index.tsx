import { Button as NativeButton, Host, Menu as NativeMenu } from '@expo/ui/swift-ui';
import { FlashList } from '@shopify/flash-list';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useState } from 'react';
import { Alert, RefreshControl, StyleSheet, View } from 'react-native';
import { Dialog, Divider, List, Portal, Text, TextInput } from 'react-native-paper';
import {
  createManagedAccount, createTemporaryAddress, deleteManagedAccount, deleteTemporaryAddress,
  fetchManagedAccounts, fetchTemporaryAddresses, setManagedAccountSuspended, setTemporaryAddressEnabled
} from '@/api/jmap';
import { AccountMenu } from '@/components/AccountMenu';
import { previewManagedAccounts, previewTemporaryAddresses } from '@/preview/fixtures';
import { useAppState } from '@/state/app-state';
import type { ManagedAccount, TemporaryAddress } from '@/types';
import { NativeGlassButton, NativeSegmentedControl } from '@/components/NativeControls';

const isSuspended = (account: ManagedAccount) =>
  Boolean((account.permissions as any)?.disabledPermissions?.authenticate);

export default function AdminScreen() {
  const { selected, password, preview } = useAppState();
  const queryClient = useQueryClient();
  const [section, setSection] = useState('accounts');
  const [dialog, setDialog] = useState<'account' | 'temporary' | null>(null);
  const [email, setEmail] = useState('');
  const [secret, setSecret] = useState('');
  const [description, setDescription] = useState('');
  const [prefix, setPrefix] = useState('');
  const [domain, setDomain] = useState('');
  const [busy, setBusy] = useState(false);

  const accounts = useQuery({
    queryKey: ['managed-accounts', selected?.id, preview], enabled: Boolean(selected),
    queryFn: async () => preview ? previewManagedAccounts : fetchManagedAccounts(selected!, await password())
  });
  const temporary = useQuery({
    queryKey: ['temporary-addresses', selected?.id, preview], enabled: Boolean(selected) && section === 'temporary',
    queryFn: async () => preview ? previewTemporaryAddresses : fetchTemporaryAddresses(selected!, await password())
  });

  const run = async (operation: (secret: string) => Promise<void>) => {
    if (preview) { Alert.alert('预览模式', '预览不会修改服务器数据。'); return; }
    setBusy(true);
    try {
      await operation(await password());
      await queryClient.invalidateQueries({ queryKey: section === 'accounts' ? ['managed-accounts'] : ['temporary-addresses'] });
    } catch (reason) {
      Alert.alert('操作失败', reason instanceof Error ? reason.message : '未知错误');
    } finally { setBusy(false); }
  };

  const create = async () => {
    if (!selected) return;
    if (section === 'accounts') {
      await run((passwordValue) => createManagedAccount(selected, passwordValue, email, secret, description));
    } else {
      await run((passwordValue) => createTemporaryAddress(selected, passwordValue, prefix, domain, description));
    }
    if (!preview) { setDialog(null); setEmail(''); setSecret(''); setDescription(''); setPrefix(''); setDomain(''); }
  };

  return (
    <View style={styles.page}>
      <Stack.Screen options={{
        title: '管理', headerLeft: () => <AccountMenu />,
        headerRight: () => <Host matchContents><NativeButton label="添加" systemImage="plus" onPress={() => setDialog(section === 'accounts' ? 'account' : 'temporary')} /></Host>
      }} />
      {preview && <Text style={styles.preview}>预览模式 · 所有管理操作只展示交互，不会写入服务器</Text>}
      <NativeSegmentedControl value={section} onChange={setSection} options={[{ value: 'accounts', label: '账户' }, { value: 'temporary', label: '临时邮箱' }]} />
      {section === 'accounts' ? (
        <FlashList
          data={accounts.data ?? []} keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={accounts.isFetching} onRefresh={() => accounts.refetch()} />}
          ItemSeparatorComponent={Divider}
          ListEmptyComponent={<Text style={styles.empty}>{accounts.error instanceof Error ? accounts.error.message : '没有账户或当前权限不足'}</Text>}
          renderItem={({ item }) => (
            <List.Item
              title={item.description || item.emailAddress}
              description={`${item.emailAddress}${isSuspended(item) ? ' · 已封禁' : ''}`}
              left={(props) => <List.Icon {...props} icon={isSuspended(item) ? 'account-cancel-outline' : 'account-circle-outline'} />}
              right={() => <AccountActions item={item} currentEmail={selected?.email} disabled={busy} onSuspend={() => selected && run((passwordValue) => setManagedAccountSuspended(selected, passwordValue, item, !isSuspended(item)))} onDelete={() => selected && Alert.alert('永久删除账户？', item.emailAddress, [{ text: '取消', style: 'cancel' }, { text: '删除', style: 'destructive', onPress: () => void run((passwordValue) => deleteManagedAccount(selected, passwordValue, item.id)) }])} />}
            />
          )}
        />
      ) : (
        <FlashList
          data={temporary.data ?? []} keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={temporary.isFetching} onRefresh={() => temporary.refetch()} />}
          ItemSeparatorComponent={Divider}
          ListEmptyComponent={<Text style={styles.empty}>{temporary.error instanceof Error ? temporary.error.message : '没有临时邮箱，或服务器未启用 Masked Email'}</Text>}
          renderItem={({ item }) => (
            <List.Item title={item.email} description={`${item.description || '无说明'} · ${item.enabled ? '启用' : '停用'}`} left={(props) => <List.Icon {...props} icon="email-fast-outline" />} right={() => <TemporaryActions item={item} disabled={busy} onToggle={() => selected && run((passwordValue) => setTemporaryAddressEnabled(selected, passwordValue, item, !item.enabled))} onDelete={() => selected && Alert.alert('删除临时邮箱？', item.email, [{ text: '取消', style: 'cancel' }, { text: '删除', style: 'destructive', onPress: () => void run((passwordValue) => deleteTemporaryAddress(selected, passwordValue, item.id)) }])} />} />
          )}
        />
      )}
      <Portal>
        <Dialog visible={dialog !== null} onDismiss={() => setDialog(null)}>
          <Dialog.Title>{dialog === 'account' ? '添加账户' : '添加临时邮箱'}</Dialog.Title>
          <Dialog.Content style={styles.form}>
            {dialog === 'account' ? <>
              <TextInput mode="outlined" label="完整邮箱地址" value={email} onChangeText={setEmail} autoCapitalize="none" />
              <TextInput mode="outlined" label="显示名称（可选）" value={description} onChangeText={setDescription} />
              <TextInput mode="outlined" label="初始密码" value={secret} onChangeText={setSecret} secureTextEntry />
            </> : <>
              <TextInput mode="outlined" label="前缀（留空自动生成）" value={prefix} onChangeText={setPrefix} autoCapitalize="none" />
              <TextInput mode="outlined" label="邮箱域名（留空使用默认）" value={domain} onChangeText={setDomain} autoCapitalize="none" />
              <TextInput mode="outlined" label="用途说明" value={description} onChangeText={setDescription} />
            </>}
          </Dialog.Content>
          <Dialog.Actions><NativeGlassButton label="取消" onPress={() => setDialog(null)} /><NativeGlassButton label={busy ? '正在创建…' : '创建'} prominent isDisabled={busy} onPress={() => void create()} /></Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

function AccountActions({ item, currentEmail, disabled, onSuspend, onDelete }: { item: ManagedAccount; currentEmail?: string; disabled: boolean; onSuspend(): void; onDelete(): void }) {
  const current = item.emailAddress.toLowerCase() === currentEmail?.toLowerCase();
  return <Host matchContents><NativeMenu label="" systemImage="ellipsis.circle"><NativeButton label={isSuspended(item) ? '解封账户' : '封禁账户'} systemImage={isSuspended(item) ? 'person.badge.plus' : 'person.badge.minus'} onPress={current || disabled ? undefined : onSuspend} /><NativeButton label="删除账户" systemImage="trash" role="destructive" onPress={current || disabled ? undefined : onDelete} /></NativeMenu></Host>;
}

function TemporaryActions({ item, disabled, onToggle, onDelete }: { item: TemporaryAddress; disabled: boolean; onToggle(): void; onDelete(): void }) {
  return <Host matchContents><NativeMenu label="" systemImage="ellipsis.circle"><NativeButton label={item.enabled ? '停用' : '启用'} systemImage={item.enabled ? 'pause.circle' : 'play.circle'} onPress={disabled ? undefined : onToggle} /><NativeButton label="删除" systemImage="trash" role="destructive" onPress={disabled ? undefined : onDelete} /></NativeMenu></Host>;
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: '#fff' }, preview: { paddingHorizontal: 16, paddingVertical: 10, color: '#666' }, empty: { padding: 32, textAlign: 'center' }, form: { gap: 12 } });
