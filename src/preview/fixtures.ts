import type { MailAccount, MailItem, ManagedAccount, TemporaryAddress } from '@/types';

export const previewAccount: MailAccount = {
  id: 'tempo-preview-admin',
  name: '演示管理员',
  email: 'admin@demo.example',
  username: 'admin@demo.example',
  sessionUrl: 'https://demo.example/.well-known/jmap',
  apiUrl: 'https://demo.example/jmap',
  accountId: 'preview'
};

export const previewAccess = {
  permissions: [
    'sysAccountGet', 'sysAccountQuery', 'sysAccountCreate', 'sysAccountUpdate', 'sysAccountDestroy',
    'sysMaskedEmailGet', 'sysMaskedEmailQuery', 'sysMaskedEmailCreate', 'sysMaskedEmailUpdate', 'sysMaskedEmailDestroy'
  ],
  edition: 'Preview'
};

export const previewMail: MailItem[] = [
  { id: 'preview-1', subject: '欢迎使用 TEMPO Mail', preview: '这里是无需登录的本地预览，不会连接任何服务器。', receivedAt: new Date().toISOString(), from: [{ name: 'TEMPO', email: 'hello@tempo.local' }], keywords: {} },
  { id: 'preview-2', subject: '管理员模式已启用', preview: '底部会比普通邮箱多出一个“管理”导航。', receivedAt: new Date(Date.now() - 3600000).toISOString(), from: [{ name: '系统', email: 'system@demo.example' }], keywords: { '$seen': true, '$flagged': true } },
  { id: 'preview-3', subject: 'OTA 通道说明', preview: '纯 TypeScript 更新继续使用 native-1 兼容通道。', receivedAt: new Date(Date.now() - 86400000).toISOString(), from: [{ name: '发布服务', email: 'release@demo.example' }], keywords: { '$seen': true } }
];

export const previewManagedAccounts: ManagedAccount[] = [
  { id: 'a1', name: 'admin', emailAddress: 'admin@demo.example', description: '演示管理员' },
  { id: 'a2', name: 'alice', emailAddress: 'alice@demo.example', description: 'Alice' },
  { id: 'a3', name: 'suspended', emailAddress: 'suspended@demo.example', description: '已封禁账户', permissions: { '@type': 'Merge', disabledPermissions: { authenticate: true } } }
];

export const previewTemporaryAddresses: TemporaryAddress[] = [
  { id: 't1', email: 'shopping-9f3a@demo.example', description: '购物网站', enabled: true },
  { id: 't2', email: 'trial-42ac@demo.example', description: '试用服务', enabled: false }
];
