import { Button, Divider, Host, Menu } from '@expo/ui/swift-ui';
import { router } from 'expo-router';
import { useAppState } from '@/state/app-state';

export function AccountMenu() {
  const { accounts, selected, select } = useAppState();
  return (
    <Host matchContents>
      <Menu label={selected?.name || '账户'} systemImage="person.crop.circle">
        {accounts.map((account) => (
          <Button key={account.id} label={account.email} systemImage={account.id === selected?.id ? 'checkmark.circle.fill' : 'person.crop.circle'} onPress={() => select(account.id)} />
        ))}
        <Divider />
        <Button label="添加账户" systemImage="person.crop.circle.badge.plus" onPress={() => router.push('/setup')} />
      </Menu>
    </Host>
  );
}
