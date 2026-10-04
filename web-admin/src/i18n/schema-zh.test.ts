import { describe, expect, it } from 'vitest';

import { localizeSchemaZh } from './schema-zh';

describe('localizeSchemaZh', () => {
  it('translates every user-facing navigation name without changing view identifiers', () => {
    const schema = {
      layouts: [
        {
          name: 'Management',
          icon: 'settings',
          items: [
            {
              container: {
                name: 'Directory',
                icon: 'book',
                items: [
                  { type: 'link', name: 'Accounts', viewName: 'Account' },
                  {
                    type: 'container',
                    name: 'Authentication',
                    items: [{ type: 'link', name: 'Directories', viewName: 'Directory' }],
                  },
                ],
              },
            },
            { link: { name: 'Dashboard', icon: 'home', viewName: 'Dashboard' } },
          ],
        },
      ],
      objects: { Directory: { type: 'object', description: 'Directories', permissionPrefix: 'directory' } },
    };

    const localized = localizeSchemaZh(schema);

    expect(localized.layouts).toMatchObject([
      {
        name: '管理',
        items: [
          {
            container: {
              name: '目录',
              items: [
                { name: '账户', viewName: 'Account' },
                {
                  name: '身份验证',
                  items: [{ name: '目录服务', viewName: 'Directory' }],
                },
              ],
            },
          },
          { link: { name: '仪表盘', viewName: 'Dashboard' } },
        ],
      },
    ]);
    expect(Object.keys(localized.objects)).toEqual(['Directory']);
  });

  it('translates enum explanations delivered by the server schema', () => {
    const schema = {
      layouts: [],
      enums: {
        status: [{ name: 'enabled', label: 'Enabled', explanation: 'Manage user accounts' }],
      },
    };

    const localized = localizeSchemaZh(schema);
    expect(localized.enums.status[0]).toMatchObject({
      name: 'enabled',
      label: '已启用',
      explanation: '管理用户账户',
    });
  });

  it('translates server-driven forms, lists, filters, actions and dashboards', () => {
    const schema = {
      layouts: [],
      lists: {
        server: {
          title: 'Mail Server',
          subtitle: 'Connection Settings',
          singularName: 'server',
          pluralName: 'servers',
          columns: [{ name: 'host', label: 'Relay Host' }],
          filters: [{ type: 'text', field: 'host', label: 'Server Hostname' }],
          massActions: [{ type: 'delete', label: 'Delete' }],
        },
      },
      forms: {
        server: {
          title: 'Server Settings',
          sections: [
            {
              title: 'Security Settings',
              fields: [
                {
                  name: 'timeout',
                  label: 'Connection Timeout',
                  placeholder: 'Maximum duration in seconds',
                },
              ],
            },
          ],
        },
      },
      dashboards: [
        {
          id: 'overview',
          label: 'Dashboard',
          cards: [{ title: 'Maximum Connections', description: 'View server connection metrics' }],
        },
      ],
    };

    const localized = localizeSchemaZh(schema);
    expect(localized.lists.server).toMatchObject({
      title: '邮件服务器',
      subtitle: '连接设置',
      columns: [{ label: '中继主机' }],
      filters: [{ label: '服务器主机名' }],
      massActions: [{ label: '删除' }],
    });
    expect(localized.forms.server).toMatchObject({
      title: '服务器设置',
      sections: [{ title: '安全设置', fields: [{ label: '连接超时' }] }],
    });
    expect(localized.dashboards[0]).toMatchObject({
      label: '仪表盘',
      cards: [{ title: '最大连接数' }],
    });
  });
});
