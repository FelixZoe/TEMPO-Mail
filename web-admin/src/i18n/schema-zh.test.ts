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

  it('fully translates the queue, logs, tasks, cluster, actions and Sieve screens', () => {
    const schema = {
      layouts: [],
      screens: [
        {
          title: 'Queued Messages',
          subtitle: 'Manage queued messages pending delivery.',
          columns: [
            { label: 'Sender' },
            { label: 'Next Retry' },
            { label: 'Recieved' },
            { label: 'Size' },
          ],
        },
        {
          title: 'Log Entries',
          subtitle: 'View server log entries.',
          columns: [{ label: 'Timestamp' }, { label: 'Level' }, { label: 'Event' }, { label: 'Details' }],
        },
        {
          title: 'Tasks',
          subtitle: 'Manage background tasks scheduled for execution.',
          columns: [{ label: 'Task Type' }, { label: 'Due' }, { label: 'Status' }],
        },
        {
          title: 'Failed Tasks',
          subtitle: 'View failed background tasks.',
          actions: [{ label: 'Create failed task' }],
        },
        {
          title: 'Cluster Nodes',
          columns: [{ label: 'Node ID' }, { label: 'Hostname' }, { label: 'Last Renewal' }],
          statuses: [{ label: 'Stale' }],
        },
        {
          title: 'Actions',
          subtitle: 'Execute server management actions.',
          actions: [
            { label: 'Reload' },
            { label: 'Application Management' },
            { label: 'Query Store' },
            { label: 'Blocked IPs List' },
            { label: 'Update Applications' },
            { label: 'Troubleshooting' },
            { label: 'Classify a Message' },
            { label: 'Invalidate All Caches' },
            { label: 'Invalidate Negative Caches' },
            { label: 'Pause Queue Processing' },
            { label: 'Resume Queue Processing' },
          ],
        },
        {
          title: 'System Sieve Interpreter',
          fields: [
            { label: 'From Name', value: "'Automated Message'" },
            { label: 'From Address', value: "'MAILER-DAEMON@' + system('domain')" },
            { label: 'Return Path' },
          ],
        },
      ],
    };

    const localized = localizeSchemaZh(schema);
    expect(localized.screens).toMatchObject([
      {
        title: '队列邮件',
        subtitle: '管理等待投递的队列邮件。',
        columns: [{ label: '发件人' }, { label: '下次重试' }, { label: '接收时间' }, { label: '大小' }],
      },
      {
        title: '日志记录',
        subtitle: '查看服务器日志记录。',
        columns: [{ label: '时间' }, { label: '级别' }, { label: '事件' }, { label: '详情' }],
      },
      {
        title: '任务',
        subtitle: '管理等待执行的后台任务。',
        columns: [{ label: '任务类型' }, { label: '到期时间' }, { label: '状态' }],
      },
      { title: '失败任务', subtitle: '查看执行失败的后台任务。', actions: [{ label: '创建失败任务' }] },
      {
        title: '集群节点',
        columns: [{ label: '节点 ID' }, { label: '主机名' }, { label: '最后续期' }],
        statuses: [{ label: '已失联' }],
      },
      {
        title: '操作',
        subtitle: '执行服务器管理操作。',
        actions: [
          { label: '重新加载' },
          { label: '应用管理' },
          { label: '查询存储' },
          { label: '已封禁 IP 列表' },
          { label: '更新应用' },
          { label: '故障排查' },
          { label: '邮件分类' },
          { label: '清除全部缓存' },
          { label: '清除负缓存' },
          { label: '暂停队列处理' },
          { label: '恢复队列处理' },
        ],
      },
      {
        title: '系统 Sieve 解释器',
        fields: [
          { label: '发件人名称', value: "'Automated Message'" },
          { label: '发件人地址', value: "'MAILER-DAEMON@' + system('domain')" },
          { label: '退信地址' },
        ],
      },
    ]);
  });

  it('translates account and server settings while preserving configuration values', () => {
    const schema = {
      layouts: [],
      screens: [
        {
          title: 'Account Profile',
          sections: [
            {
              title: 'Personal Information',
              fields: [
                { label: 'Display Name', placeholder: 'Display Name', value: 'Tempo Admin' },
                { label: 'Username', value: 'admin@darker.one' },
                { label: 'Language', value: 'zh-CN' },
                { label: 'Time Zone', value: 'Asia/Shanghai' },
              ],
            },
            {
              title: 'Security Settings',
              fields: [
                { label: 'Current Password', value: 'do-not-translate' },
                { label: 'New Password' },
                { label: 'Confirm Password' },
                { label: 'Two-Factor Authentication' },
                { label: 'Recovery Codes' },
              ],
            },
          ],
          actions: [{ label: 'Save Changes' }, { label: 'Sign Out' }],
        },
        {
          title: 'Server Settings',
          fields: [
            { label: 'Bind Address', value: '0.0.0.0' },
            { label: 'Listen Port', value: '443' },
            { label: 'TLS Certificate', value: '/data/certs/fullchain.pem' },
            { label: 'TLS Private Key', value: '/data/certs/privkey.pem' },
            { label: 'Worker Threads', value: '4' },
            { label: 'Connection Pool', value: '10' },
            { label: 'Read Timeout', value: '30s' },
            { label: 'Rate Limit', value: '100/min' },
          ],
        },
      ],
    };

    expect(localizeSchemaZh(schema)).toMatchObject({
      screens: [
        {
          title: '账户资料',
          sections: [
            {
              title: '个人信息',
              fields: [
                { label: '显示名称', placeholder: '显示名称', value: 'Tempo Admin' },
                { label: '用户名', value: 'admin@darker.one' },
                { label: '语言', value: 'zh-CN' },
                { label: '时区', value: 'Asia/Shanghai' },
              ],
            },
            {
              title: '安全设置',
              fields: [
                { label: '当前密码', value: 'do-not-translate' },
                { label: '新密码' },
                { label: '确认密码' },
                { label: '双重身份验证' },
                { label: '恢复代码' },
              ],
            },
          ],
          actions: [{ label: '保存更改' }, { label: '退出登录' }],
        },
        {
          title: '服务器设置',
          fields: [
            { label: '绑定地址', value: '0.0.0.0' },
            { label: '监听端口', value: '443' },
            { label: 'TLS 证书', value: '/data/certs/fullchain.pem' },
            { label: 'TLS 私钥', value: '/data/certs/privkey.pem' },
            { label: '工作线程数', value: '4' },
            { label: '连接池', value: '10' },
            { label: '读取超时', value: '30s' },
            { label: '速率限制', value: '100/min' },
          ],
        },
      ],
    });
  });
});
