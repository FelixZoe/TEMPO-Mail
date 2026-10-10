export const DEFAULT_MAIL_SERVER = process.env.EXPO_PUBLIC_DEFAULT_MAIL_SERVER ?? 'https://mail.darker.one';
export const DEFAULT_MAIL_DOMAIN = process.env.EXPO_PUBLIC_DEFAULT_MAIL_DOMAIN ?? 'darker.one';
export const DEFAULT_REGISTRATION_URL = process.env.EXPO_PUBLIC_REGISTRATION_URL?.trim() || 'https://mail.darker.one/register-api/v1/register';
