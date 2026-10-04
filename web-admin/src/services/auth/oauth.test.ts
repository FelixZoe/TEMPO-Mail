/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import { describe, it, expect } from 'vitest';
import { generateCodeVerifier, generateCodeChallenge } from './oauth';

const UNRESERVED_RE = /^[A-Za-z0-9\-._~]+$/;

describe('generateCodeVerifier', () => {
  it('defaults to 64 characters', () => {
    const verifier = generateCodeVerifier();
    expect(verifier).toHaveLength(64);
  });

  it('honours a custom length', () => {
    expect(generateCodeVerifier(43)).toHaveLength(43);
    expect(generateCodeVerifier(128)).toHaveLength(128);
  });

  it('rejects lengths outside RFC 7636 range', () => {
    expect(() => generateCodeVerifier(42)).toThrow();
    expect(() => generateCodeVerifier(129)).toThrow();
  });

  it('returns different values on each call', () => {
    const a = generateCodeVerifier();
    const b = generateCodeVerifier();
    expect(a).not.toBe(b);
  });

  it('only contains RFC 3986 unreserved characters', () => {
    const verifier = generateCodeVerifier();
    expect(verifier).toMatch(UNRESERVED_RE);
  });

  it('consistently produces unreserved-only output across multiple calls', () => {
    for (let i = 0; i < 20; i++) {
      const v = generateCodeVerifier();
      expect(v).toMatch(UNRESERVED_RE);
      expect(v).toHaveLength(64);
    }
  });

  it('exercises every character in the alphabet given enough samples', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 50; i++) {
      for (const ch of generateCodeVerifier(128)) seen.add(ch);
    }
    for (const ch of '-._~') {
      expect(seen.has(ch)).toBe(true);
    }
  });
});

describe('generateCodeChallenge', () => {
  it('returns a base64url string without +, /, or =', async () => {
    const { challenge } = await generateCodeChallenge('test-verifier');
    expect(challenge).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it('produces consistent output for same input', async () => {
    const a = await generateCodeChallenge('same-input');
    const b = await generateCodeChallenge('same-input');
    expect(a).toEqual(b);
  });

  it('produces different output for different inputs', async () => {
    const a = await generateCodeChallenge('input-one');
    const b = await generateCodeChallenge('input-two');
    expect(a.challenge).not.toBe(b.challenge);
  });

  it('returns a non-empty string', async () => {
    const { challenge } = await generateCodeChallenge('anything');
    expect(challenge.length).toBeGreaterThan(0);
  });

  it('produces a SHA-256 sized output (43 base64url chars for 32 bytes) when S256 is used', async () => {
    const { challenge, method } = await generateCodeChallenge('test');
    expect(method).toBe('S256');
    expect(challenge).toHaveLength(43);
  });

  it('falls back to plain when crypto.subtle is unavailable', async () => {
    const originalSubtle = crypto.subtle;
    Object.defineProperty(crypto, 'subtle', {
      configurable: true,
      get: () => undefined,
    });
    try {
      const { challenge, method } = await generateCodeChallenge('plain-verifier');
      expect(method).toBe('plain');
      expect(challenge).toBe('plain-verifier');
    } finally {
      Object.defineProperty(crypto, 'subtle', {
        configurable: true,
        value: originalSubtle,
      });
    }
  });
});
