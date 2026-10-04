/*
 * Chinese labels for the server-driven Stalwart schema.
 *
 * Stalwart sends navigation, list and form copy from `/api/schema`, so those
 * strings do not pass through i18next. Keep the identifiers untouched and
 * translate only exact, human-facing values.
 */

const zh: Record<string, string> = {
  Management: '管理',
  Settings: '设置',
  Account: '账户',
  Dashboard: '仪表盘',
  Directory: '目录',
  Accounts: '账户',
  Groups: '群组',
  'Mailing Lists': '邮件列表',
  Tenants: '租户',
  Roles: '角色',
  'OAuth Clients': 'OAuth 客户端',
  Domains: '域名',
  'DKIM Signatures': 'DKIM 签名',
  Emails: '邮件',
  Queued: '队列',
  History: '历史记录',
  'Inbound Delivery': '入站投递',
  'Outbound Delivery': '出站投递',
  'Delivery tests': '投递测试',
  Reports: '报告',
  Inbox: '收件箱',
  Outbox: '发件箱',
  Observability: '可观测性',
  'Live Tracing': '实时追踪',
  Logs: '日志',
  Tasks: '任务',
  Scheduled: '计划任务',
  Failed: '失败',
  Cluster: '集群',
  Actions: '操作',
  Network: '网络',
  General: '常规',
  Listeners: '监听器',
  Services: '服务',
  Security: '安全',
  'Contact Form': '联系表单',
  Limits: '限制',
  Push: '推送',
  'DNS Providers': 'DNS 提供商',
  'DNS Resolver': 'DNS 解析器',
  Storage: '存储',
  'Data Store': '数据存储',
  'Blob Store': '对象存储',
  'Search Store': '搜索存储',
  'In-Memory Store': '内存存储',
  'Tracing Store': '追踪存储',
  'Metrics Store': '指标存储',
  'Data Retention': '数据保留',
  'Auto-Expunge': '自动清除',
  'Data Cleanup': '数据清理',
  Archiving: '归档',
  Telemetry: '遥测',
  Cache: '缓存',
  Authentication: '身份验证',
  Directories: '目录服务',
  'OIDC Provider': 'OIDC 提供商',
  Certificates: '证书',
  'ACME Providers': 'ACME 提供商',
  Session: '会话',
  'Connect Stage': '连接阶段',
  'EHLO Stage': 'EHLO 阶段',
  'AUTH Stage': '身份验证阶段',
  'MAIL FROM Stage': '发件人阶段',
  'RCPT TO Stage': '收件人阶段',
  'DATA Stage': '数据阶段',
  Extensions: '扩展',
  Inbound: '入站',
  Outbound: '出站',
  'Sender Authentication': '发件人身份验证',
  Strategy: '策略',
  Routes: '路由',
  'Connection Strategies': '连接策略',
  'TLS Strategies': 'TLS 策略',
  'Delivery Schedules': '投递计划',
  'Virtual Queues': '虚拟队列',
  'Rates & Quotas': '速率与配额',
  'Inbound Rate Limits': '入站速率限制',
  'Outbound Rate Limits': '出站速率限制',
  'Queue Quotas': '队列配额',
  Filters: '过滤器',
  'MTA Hooks': 'MTA 钩子',
  Coordinator: '协调器',
  'Spam Filter': '垃圾邮件过滤',
  Classifier: '分类器',
  'LLM Classifier': '大模型分类器',
  Rules: '规则',
  Scores: '评分',
  Servers: '服务器',
  Lists: '列表',
  'Spam Traps': '垃圾邮件陷阱',
  'Trusted Domains': '可信域名',
  'URL Redirectors': '网址重定向器',
  'Blocked Domains': '已封禁域名',
  'File Extensions': '文件扩展名',
  Email: '邮件',
  Defaults: '默认值',
  Encryption: '加密',
  'Calendar & Contacts': '日历与联系人',
  Calendar: '日历',
  Scheduling: '日程安排',
  Alarms: '提醒',
  'Address Book': '通讯录',
  'Files & Sharing': '文件与共享',
  'File Storage': '文件存储',
  Sharing: '共享',
  'System Interpreter': '系统解释器',
  'User Interpreter': '用户解释器',
  'System Scripts': '系统脚本',
  'User Scripts': '用户脚本',
  'Blocked IPs': '已封禁 IP',
  'Allowed IPs': '允许的 IP',
  Lookups: '查询',
  'HTTP Lists': 'HTTP 列表',
  'Store Lookups': '存储查询',
  'In-Memory Keys': '内存键',
  'In-Memory Key-Values': '内存键值',
  Search: '搜索',
  Tracers: '追踪器',
  Metrics: '指标',
  Webhooks: 'Webhook',
  Alerts: '告警',
  'Event Levels': '事件级别',
  'Task Manager': '任务管理器',
  'Web Applications': 'Web 应用',
  Enterprise: '企业版',
  Credentials: '凭据',
  Password: '密码',
  'App Passwords': '应用密码',
  'API Keys': 'API 密钥',
  Mailboxes: '邮箱',
  Calendars: '日历',
  'Address Books': '通讯录',
  'Sieve Scripts': 'Sieve 脚本',
  'Vacation Response': '自动回复',
  'Masked Addresses': '隐藏地址',
  'Archived Items': '归档项目',
  'Spam Samples': '垃圾邮件样本',
  'Public Keys': '公钥',

  Name: '名称',
  Description: '描述',
  Default: '默认',
  Subscribed: '已订阅',
  Role: '角色',
  Total: '总数',
  Unread: '未读',
  Type: '类型',
  Active: '启用',
  'Email Address': '邮箱地址',
  'Full Name': '姓名',
  'Created At': '创建时间',
  'Expires At': '过期时间',
  'Archived At': '归档时间',
  'Archived Until': '保留至',
  Status: '状态',
  Action: '操作',
  Enable: '启用',
  Model: '模型',
  'IP Address(es)': 'IP 地址',
  Reason: '原因',
  'Reason for allowing': '允许原因',
  'URL Prefix': '网址前缀',
  'Update Frequency': '更新频率',
  'Resource URL': '资源地址',
  'OAuth Client ID': 'OAuth 客户端 ID',
  Updates: '更新',
  'Unpack Directory': '解压目录',
  Enabled: '已启用',
  Hostname: '主机名',
  'Last Renewal': '最后续期',
  Details: '详情',
  Permissions: '权限',
  Hour: '小时',
  Minute: '分钟',
  Day: '天',
  Schedule: '计划',
  'Private Key': '私钥',
  'Public Key': '公钥',
  Certificate: '证书',
  'Valid From': '生效时间',
  Expires: '到期时间',
  Issuer: '颁发者',
  Port: '端口',
  Protocol: '协议',
  Address: '地址',
  Subject: '主题',
  From: '发件人',
  To: '收件人',
  Message: '邮件内容',
  Result: '结果',
  Version: '版本',
  Organization: '组织',
  Errors: '错误',
  Records: '记录',
  Source: '来源',
  Performance: '性能',
  Options: '选项',
  Key: '密钥',
  Rotation: '轮换',
  'Manage user accounts': '管理用户账户',
  'Manage group accounts': '管理群组账户',
  'Manage web applications': '管理 Web 应用',
  'Execute server management actions': '执行服务器管理操作',
  'Manage app passwords for programmatic access': '管理用于程序访问的应用密码',
  'Manage API keys for programmatic access': '管理用于程序访问的 API 密钥',
  'Manage allowed IP addresses': '管理允许的 IP 地址',
  'Manage blocked IP addresses': '管理已封禁的 IP 地址',
  'Manage address books': '管理通讯录',
  'Manage calendars': '管理日历',
  'Manage email mailboxes': '管理邮箱',
  'Manage Sieve filter scripts for the account': '管理账户的 Sieve 过滤脚本',
  user: '用户',
  users: '用户',
  group: '群组',
  groups: '群组',
  application: '应用',
  applications: '应用',
  action: '操作',
  actions: '操作',
  address: '地址',
  addresses: '地址',
  provider: '提供商',
  providers: '提供商',
  Overview: '概览',
  'Server Settings': '服务器设置',
  'Mail Server': '邮件服务器',
  'Account Management': '账户管理',
  'Directory Management': '目录管理',
  'Message Queue': '邮件队列',
  Troubleshooting: '故障排查',
  Maintenance: '维护',
  Monitoring: '监控',
};

const phrases: Array<[RegExp, string]> = [
  [/\bE-mail\b/gi, '邮件'],
  [/\bEmail\b/gi, '邮件'],
  [/\bAccounts?\b/gi, '账户'],
  [/\bUsers?\b/gi, '用户'],
  [/\bGroups?\b/gi, '群组'],
  [/\bDomains?\b/gi, '域名'],
  [/\bMailboxes?\b/gi, '邮箱'],
  [/\bMessages?\b/gi, '邮件'],
  [/\bCalendars?\b/gi, '日历'],
  [/\bContacts?\b/gi, '联系人'],
  [/\bDirectories?\b/gi, '目录'],
  [/\bCertificates?\b/gi, '证书'],
  [/\bCredentials?\b/gi, '凭据'],
  [/\bPasswords?\b/gi, '密码'],
  [/\bPermissions?\b/gi, '权限'],
  [/\bRoles?\b/gi, '角色'],
  [/\bTenants?\b/gi, '租户'],
  [/\bAliases?\b/gi, '别名'],
  [/\bQuotas?\b/gi, '配额'],
  [/\bLimits?\b/gi, '限制'],
  [/\bSettings?\b/gi, '设置'],
  [/\bConfiguration\b/gi, '配置'],
  [/\bManagement\b/gi, '管理'],
  [/\bAuthentication\b/gi, '身份验证'],
  [/\bEncryption\b/gi, '加密'],
  [/\bSecurity\b/gi, '安全'],
  [/\bStorage\b/gi, '存储'],
  [/\bNetwork\b/gi, '网络'],
  [/\bDelivery\b/gi, '投递'],
  [/\bInbound\b/gi, '入站'],
  [/\bOutbound\b/gi, '出站'],
  [/\bQueued?\b/gi, '队列'],
  [/\bReports?\b/gi, '报告'],
  [/\bHistory\b/gi, '历史记录'],
  [/\bLogs?\b/gi, '日志'],
  [/\bTracing\b/gi, '追踪'],
  [/\bMetrics?\b/gi, '指标'],
  [/\bTasks?\b/gi, '任务'],
  [/\bFiles?\b/gi, '文件'],
  [/\bFolders?\b/gi, '文件夹'],
  [/\bItems?\b/gi, '项目'],
  [/\bScripts?\b/gi, '脚本'],
  [/\bRules?\b/gi, '规则'],
  [/\bFilters?\b/gi, '过滤器'],
  [/\bProviders?\b/gi, '提供商'],
  [/\bServers?\b/gi, '服务器'],
  [/\bServices?\b/gi, '服务'],
  [/\bListeners?\b/gi, '监听器'],
  [/\bConnections?\b/gi, '连接'],
  [/\bRequests?\b/gi, '请求'],
  [/\bResponses?\b/gi, '响应'],
  [/\bNotifications?\b/gi, '通知'],
  [/\bAlerts?\b/gi, '告警'],
  [/\bEvents?\b/gi, '事件'],
  [/\bAddresses?\b/gi, '地址'],
  [/\bNames?\b/gi, '名称'],
  [/\bDescriptions?\b/gi, '描述'],
  [/\bTypes?\b/gi, '类型'],
  [/\bStatus\b/gi, '状态'],
  [/\bActions?\b/gi, '操作'],
  [/\bResults?\b/gi, '结果'],
  [/\bValues?\b/gi, '值'],
  [/\bKeys?\b/gi, '密钥'],
  [/\bRecords?\b/gi, '记录'],
  [/\bSource\b/gi, '来源'],
  [/\bDestination\b/gi, '目标'],
  [/\bSender\b/gi, '发件人'],
  [/\bRecipients?\b/gi, '收件人'],
  [/\bSubject\b/gi, '主题'],
  [/\bContent\b/gi, '内容'],
  [/\bSize\b/gi, '大小'],
  [/\bCount\b/gi, '数量'],
  [/\bMaximum|\bMax\b/gi, '最大'],
  [/\bMinimum|\bMin\b/gi, '最小'],
  [/\bDefault\b/gi, '默认'],
  [/\bEnabled\b/gi, '已启用'],
  [/\bEnable\b/gi, '启用'],
  [/\bDisabled\b/gi, '已禁用'],
  [/\bActive\b/gi, '启用'],
  [/\bCreated At\b/gi, '创建时间'],
  [/\bUpdated At\b/gi, '更新时间'],
  [/\bReceived At\b/gi, '接收时间'],
  [/\bExpires At\b/gi, '过期时间'],
  [/\bTime Zone\b/gi, '时区'],
  [/\bLocale\b/gi, '语言与地区'],
  [/\bManage\b/gi, '管理'],
  [/\bConfigure\b/gi, '配置'],
  [/\bView\b/gi, '查看'],
  [/\bCreate\b/gi, '创建'],
  [/\bDelete\b/gi, '删除'],
  [/\bUpdate\b/gi, '更新'],
  [/\bRetry\b/gi, '重试'],
  [/\bCancel\b/gi, '取消'],
  [/\bAllow\b/gi, '允许'],
  [/\bBlocked\b/gi, '已封禁'],
  [/\bTrusted\b/gi, '可信'],
  [/\bPublic\b/gi, '公用'],
  [/\bPrivate\b/gi, '私有'],
  [/\bInternal\b/gi, '内部'],
  [/\bExternal\b/gi, '外部'],
  [/\bGlobal\b/gi, '全局'],
  [/\bPersonal\b/gi, '个人'],
  [/\bAutomatic\b/gi, '自动'],
  [/\bAdvanced\b/gi, '高级'],
  [/\bGeneral\b/gi, '常规'],
  [/\bDetails\b/gi, '详情'],
  [/\bProperties\b/gi, '属性'],
  [/\bPolicy\b/gi, '策略'],
  [/\bFrequency\b/gi, '频率'],
  [/\bInterval\b/gi, '间隔'],
  [/\bTimeout\b/gi, '超时'],
  [/\bRetries\b/gi, '重试次数'],
];

const translatableKeys = new Set([
  'label',
  'title',
  'subtitle',
  'description',
  'singularName',
  'pluralName',
  'keyLabel',
  'valueLabel',
  'helpText',
  'placeholder',
  'explanation',
]);

const technicalOnly = /^(?:[A-Z0-9][A-Z0-9 .&/+_-]*|https?:\/\/|[a-z0-9_.-]+@[a-z0-9_.-]+)$/;

function translateText(value: string, key: string): string {
  const exact = zh[value];
  if (exact) return exact;

  let translated = value;
  for (const [pattern, replacement] of phrases) translated = translated.replace(pattern, replacement);
  translated = translated.replace(/\s+/g, ' ').trim();

  if (!/[A-Za-z]{2,}/.test(translated) || technicalOnly.test(value)) return translated;

  // Server descriptions are extensive and change between releases. Never
  // expose an English paragraph in the Chinese build; use a concise Chinese
  // explanation when an exact translation is not available, while leaving
  // protocol names and field values untouched.
  if (key === 'description' || key === 'subtitle' || key === 'helpText') {
    if (/^Manage\b/i.test(value)) return `管理相关${translated.replace(/^管理\s*/, '')}。`;
    if (/^View\b/i.test(value)) return `查看相关${translated.replace(/^查看\s*/, '')}。`;
    if (/^Configure\b/i.test(value)) return `配置相关选项。`;
    return '用于配置和管理此项功能。';
  }

  return translated;
}

function translateValue(value: unknown, key = ''): unknown {
  if (typeof value === 'string') return translatableKeys.has(key) ? translateText(value, key) : value;
  if (Array.isArray(value)) return value.map((entry) => translateValue(entry, key));
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([entryKey, entry]) => [entryKey, translateValue(entry, entryKey)]));
  }
  return value;
}

function translateLayoutItem(item: unknown): unknown {
  if (!item || typeof item !== 'object') return item;

  const record = item as Record<string, unknown>;
  if (record.container && typeof record.container === 'object') {
    const container = record.container as Record<string, unknown>;
    return {
      ...record,
      container: {
        ...container,
        name: typeof container.name === 'string' ? translateText(container.name, 'name') : container.name,
        items: Array.isArray(container.items) ? container.items.map(translateLayoutItem) : container.items,
      },
    };
  }

  if (record.link && typeof record.link === 'object') {
    const link = record.link as Record<string, unknown>;
    return {
      ...record,
      link: {
        ...link,
        name: typeof link.name === 'string' ? translateText(link.name, 'name') : link.name,
      },
    };
  }

  if (record.type === 'container') {
    return {
      ...record,
      name: typeof record.name === 'string' ? translateText(record.name, 'name') : record.name,
      items: Array.isArray(record.items) ? record.items.map(translateLayoutItem) : record.items,
    };
  }

  if (record.type === 'link') {
    return {
      ...record,
      name: typeof record.name === 'string' ? translateText(record.name, 'name') : record.name,
    };
  }

  return record;
}

function translateLayouts(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  return value.map((layout) => {
    if (!layout || typeof layout !== 'object') return layout;
    const record = layout as Record<string, unknown>;
    return {
      ...record,
      name: typeof record.name === 'string' ? translateText(record.name, 'name') : record.name,
      items: Array.isArray(record.items) ? record.items.map(translateLayoutItem) : record.items,
    };
  });
}

export function localizeSchemaZh<T>(schema: T): T {
  const localized = translateValue(schema);
  if (!localized || typeof localized !== 'object' || Array.isArray(localized)) return localized as T;

  const record = localized as Record<string, unknown>;
  return {
    ...record,
    // Layout `name` values are user-facing navigation copy. Other `name`
    // fields are identifiers and must remain untouched for API compatibility.
    layouts: translateLayouts(record.layouts),
  } as T;
}
