import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { Divider, List, Text } from 'react-native-paper';
import { fetchMail } from '@/api/jmap';
import { AccountMenu } from '@/components/AccountMenu';
import { useAppState } from '@/state/app-state';
import { previewMail } from '@/preview/fixtures';
import { Button as NativeButton, Host } from '@expo/ui/swift-ui';

export function MailScreen({ role, title }: { role: 'inbox' | 'starred' | 'sent'; title: string }) {
  const { selected, password, preview } = useAppState();
  const [search, setSearch] = useState('');
  const query = useQuery({
    queryKey: ['mail', selected?.id, role, search],
    enabled: Boolean(selected),
    queryFn: async () => {
      if (preview) {
        const query = search.trim().toLowerCase();
        return previewMail.filter((item) => {
          if (role === 'starred' && !item.keywords?.['$flagged']) return false;
          if (role === 'sent') return false;
          return !query || `${item.subject} ${item.preview} ${item.from?.[0]?.email}`.toLowerCase().includes(query);
        });
      }
      return fetchMail(selected!, await password(), role, search);
    }
  });
  return (
    <View style={styles.page}>
      <Stack.Screen options={{
        title,
        headerLeft: () => <AccountMenu />,
        headerRight: () => <Host matchContents><NativeButton label="写邮件" systemImage="square.and.pencil" onPress={() => router.push('/compose')} /></Host>,
        headerSearchBarOptions: { placeholder: '搜索邮件', onChangeText: (event) => setSearch(event.nativeEvent.text) }
      }} />
      <FlashList
        data={query.data ?? []}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={query.isFetching} onRefresh={() => query.refetch()} />}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={<Text style={styles.empty}>{query.error instanceof Error ? query.error.message : '没有邮件'}</Text>}
        renderItem={({ item }) => <List.Item title={item.from?.[0]?.name || item.from?.[0]?.email || '未知发件人'} description={`${item.subject || '（无主题）'}\n${item.preview || ''}`} left={(props) => <List.Icon {...props} icon={item.keywords?.['$seen'] ? 'email-open-outline' : 'email'} />} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({ page: { flex: 1, backgroundColor: '#ffffff' }, empty: { padding: 32, textAlign: 'center' } });
