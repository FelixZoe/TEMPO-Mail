import { createHash, timingSafeEqual, randomUUID } from 'node:crypto';
import http from 'node:http';
import { DatabaseSync } from 'node:sqlite';

const port = Number(process.env.PORT || 8015);
const mailOrigin = required('MAIL_ORIGIN').replace(/\/$/, '');
const mailDomain = required('MAIL_DOMAIN').toLowerCase();
const domainId = required('MAIL_DOMAIN_ID');
const serviceUser = required('STALWART_SERVICE_USER');
const servicePassword = required('STALWART_SERVICE_PASSWORD');
const inviteHash = Buffer.from(required('REGISTRATION_INVITE_SHA256'), 'hex');
const databasePath = process.env.DATABASE_PATH || '/var/lib/tempo-mail-registration/registration.sqlite';
const reservedNames = new Set(['abuse', 'admin', 'administrator', 'billing', 'contact', 'help', 'hostmaster', 'info', 'mail', 'mailer-daemon', 'noreply', 'no-reply', 'postmaster', 'root', 'security', 'support', 'system', 'webmaster']);

if (inviteHash.length !== 32) throw new Error('REGISTRATION_INVITE_SHA256 must be a SHA-256 hex digest');

const db = new DatabaseSync(databasePath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA busy_timeout = 3000;
  CREATE TABLE IF NOT EXISTS registration_attempts (
    id INTEGER PRIMARY KEY,
    occurred_at INTEGER NOT NULL,
    ip TEXT NOT NULL,
    local_part TEXT,
    succeeded INTEGER NOT NULL DEFAULT 0
  );
  CREATE INDEX IF NOT EXISTS idx_registration_attempts_ip_time
    ON registration_attempts(ip, occurred_at);
`);

const insertAttempt = db.prepare('INSERT INTO registration_attempts (occurred_at, ip, local_part, succeeded) VALUES (?, ?, ?, ?)');
const countIpAttempts = db.prepare('SELECT COUNT(*) AS count FROM registration_attempts WHERE ip = ? AND occurred_at >= ?');
const countIpSuccesses = db.prepare('SELECT COUNT(*) AS count FROM registration_attempts WHERE ip = ? AND succeeded = 1 AND occurred_at >= ?');
const countGlobalSuccesses = db.prepare('SELECT COUNT(*) AS count FROM registration_attempts WHERE succeeded = 1 AND occurred_at >= ?');
const pruneAttempts = db.prepare('DELETE FROM registration_attempts WHERE occurred_at < ?');

function required(name) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function json(response, status, body, extraHeaders = {}) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...extraHeaders
  });
  response.end(JSON.stringify(body));
}

function clientIp(request) {
  const forwarded = request.headers['x-real-ip'];
  return (Array.isArray(forwarded) ? forwarded[0] : forwarded || request.socket.remoteAddress || 'unknown').slice(0, 128);
}

function validInvite(value) {
  const candidate = createHash('sha256').update(value, 'utf8').digest();
  return candidate.length === inviteHash.length && timingSafeEqual(candidate, inviteHash);
}

function validate(localPart, password) {
  if (!/^[a-z0-9](?:[a-z0-9._-]{1,30}[a-z0-9])$/.test(localPart) || localPart.includes('..')) {
    return '邮箱名需为 3–32 位小写字母、数字、点、横线或下划线';
  }
  if (reservedNames.has(localPart)) return '这个邮箱名不可注册';
  if (password.length < 12 || password.length > 128 || !/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return '密码需为 12–128 位，并同时包含字母和数字';
  }
  return '';
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 8192) throw Object.assign(new Error('请求内容过大'), { status: 413 });
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('请求格式无效'), { status: 400 });
  }
}

async function createAccount(localPart, password) {
  const body = {
    using: ['urn:ietf:params:jmap:core', 'urn:stalwart:jmap'],
    methodCalls: [['x:Account/set', { create: { account: {
      '@type': 'User',
      name: localPart,
      domainId,
      description: 'Self-service registration',
      credentials: { '0': { '@type': 'Password', secret: password } },
      memberGroupIds: {},
      roles: { '@type': 'User' },
      permissions: { '@type': 'Inherit' },
      quotas: {},
      aliases: {},
      encryptionAtRest: { '@type': 'Disabled' }
    } } }, 'register']]
  };
  const response = await fetch(`${mailOrigin}/jmap`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${Buffer.from(`${serviceUser}:${servicePassword}`).toString('base64')}`
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12000)
  });
  if (!response.ok) throw new Error(`Stalwart returned HTTP ${response.status}`);
  const result = await response.json();
  const method = result.methodResponses?.[0];
  const failure = method?.[0] === 'error' ? method[1] : method?.[1]?.notCreated?.account;
  if (failure) {
    const text = `${failure.type || ''} ${failure.description || ''}`.toLowerCase();
    if (text.includes('already') || text.includes('exist') || text.includes('duplicate')) {
      throw Object.assign(new Error('这个邮箱名已经被使用'), { status: 409 });
    }
    throw new Error(failure.description || failure.type || '账户创建失败');
  }
  if (!method?.[1]?.created?.account?.id) throw new Error('Stalwart did not return an account id');
}

const server = http.createServer(async (request, response) => {
  const requestId = randomUUID();
  const path = new URL(request.url || '/', 'http://localhost').pathname;
  if (request.method === 'GET' && path === '/healthz') return json(response, 200, { ok: true });
  if (request.method !== 'POST' || !['/v1/register', '/register-api/v1/register'].includes(path)) {
    return json(response, 404, { error: '接口不存在' });
  }

  const ip = clientIp(request);
  const now = Date.now();
  try {
    const attempts = Number(countIpAttempts.get(ip, now - 60 * 60 * 1000).count);
    const ipSuccesses = Number(countIpSuccesses.get(ip, now - 24 * 60 * 60 * 1000).count);
    const globalSuccesses = Number(countGlobalSuccesses.get(now - 24 * 60 * 60 * 1000).count);
    if (attempts >= 8 || ipSuccesses >= 3 || globalSuccesses >= 50) {
      return json(response, 429, { error: '注册请求过于频繁，请稍后再试' }, { 'Retry-After': '3600' });
    }

    const body = await readBody(request);
    const localPart = String(body.localPart || '').trim().toLowerCase();
    const password = String(body.password || '');
    const invite = String(body.inviteCode || '');
    const validationError = validate(localPart, password);
    if (validationError) {
      insertAttempt.run(now, ip, localPart, 0);
      return json(response, 400, { error: validationError });
    }
    if (!validInvite(invite)) {
      insertAttempt.run(now, ip, localPart, 0);
      return json(response, 403, { error: '邀请码无效' });
    }

    await createAccount(localPart, password);
    insertAttempt.run(now, ip, localPart, 1);
    if (Math.random() < 0.05) pruneAttempts.run(now - 30 * 24 * 60 * 60 * 1000);
    console.info(JSON.stringify({ event: 'registration_succeeded', requestId, ip, localPart }));
    return json(response, 201, { email: `${localPart}@${mailDomain}` });
  } catch (error) {
    const status = Number(error?.status) || 500;
    insertAttempt.run(now, ip, null, 0);
    console.error(JSON.stringify({ event: 'registration_failed', requestId, ip, status, message: error instanceof Error ? error.message : 'unknown' }));
    return json(response, status, { error: status < 500 && error instanceof Error ? error.message : '服务器暂时无法完成注册' });
  }
});

server.requestTimeout = 15000;
server.headersTimeout = 10000;
server.listen(port, '127.0.0.1', () => console.info(JSON.stringify({ event: 'registration_started', port })));
