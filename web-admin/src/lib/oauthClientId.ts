/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

const DEFAULT_CLIENT_ID = 'stalwart-webui';

let cached: string | undefined;

export function getOAuthClientId(): string {
  if (cached !== undefined) return cached;

  const injected = document.querySelector('meta[name="oauth-client-id"]')?.getAttribute('content')?.trim();
  cached = injected ? injected : DEFAULT_CLIENT_ID;
  return cached;
}
