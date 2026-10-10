import { DEFAULT_MAIL_DOMAIN, DEFAULT_REGISTRATION_URL } from '@/config';

type RegistrationResponse = { email?: string; error?: string };

export async function registerDefaultAccount(localPart: string, password: string, inviteCode: string) {
  if (!DEFAULT_REGISTRATION_URL) throw new Error('服务器暂未开放注册');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(DEFAULT_REGISTRATION_URL, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ localPart: localPart.trim().toLowerCase(), password, inviteCode: inviteCode.trim() }),
      signal: controller.signal
    });
    const result = await response.json().catch(() => ({})) as RegistrationResponse;
    if (!response.ok) throw new Error(result.error || `注册失败（HTTP ${response.status}）`);
    return result.email || `${localPart.trim().toLowerCase()}@${DEFAULT_MAIL_DOMAIN}`;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw new Error('注册请求超时，请稍后重试');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

