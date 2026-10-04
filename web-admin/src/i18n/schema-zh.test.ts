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
});
