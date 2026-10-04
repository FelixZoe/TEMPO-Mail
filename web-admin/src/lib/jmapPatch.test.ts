/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import { describe, it, expect } from 'vitest';
import { calculateJmapPatch, escapeJsonPointerToken } from './jmapPatch';

describe('calculateJmapPatch', () => {
  it('detects changed primitives', () => {
    const original = { name: 'Alice', age: 30, active: true };
    const modified = { name: 'Bob', age: 31, active: false };
    expect(calculateJmapPatch(original, modified)).toEqual({
      name: 'Bob',
      age: 31,
      active: false,
    });
  });

  it('detects added fields', () => {
    const original = { name: 'Alice' };
    const modified = { name: 'Alice', email: 'alice@example.com' };
    expect(calculateJmapPatch(original, modified)).toEqual({
      email: 'alice@example.com',
    });
  });

  it('detects removed fields (set to null)', () => {
    const original = { name: 'Alice', email: 'alice@example.com' };
    const modified = { name: 'Alice' };
    expect(calculateJmapPatch(original, modified)).toEqual({
      email: null,
    });
  });

  it('returns empty object when nothing changed', () => {
    const original = { name: 'Alice', age: 30, active: true };
    const modified = { name: 'Alice', age: 30, active: true };
    expect(calculateJmapPatch(original, modified)).toEqual({});
  });

  it('returns empty object for two empty objects', () => {
    expect(calculateJmapPatch({}, {})).toEqual({});
  });

  it('produces JSON pointer paths for nested changes', () => {
    const original = { address: { city: 'NYC', zip: '10001' } };
    const modified = { address: { city: 'LA', zip: '10001' } };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'address/city': 'LA',
    });
  });

  it('handles deeply nested changes', () => {
    const original = { a: { b: { c: { d: 1 } } } };
    const modified = { a: { b: { c: { d: 2 } } } };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'a/b/c/d': 2,
    });
  });

  it('detects added nested fields', () => {
    const original = { address: { city: 'NYC' } };
    const modified = { address: { city: 'NYC', zip: '10001' } };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'address/zip': '10001',
    });
  });

  it('detects removed nested fields', () => {
    const original = { address: { city: 'NYC', zip: '10001' } };
    const modified = { address: { city: 'NYC' } };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'address/zip': null,
    });
  });

  it('detects set additions', () => {
    const original = { keywords: { important: true } };
    const modified = { keywords: { important: true, urgent: true } };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'keywords/urgent': true,
    });
  });

  it('detects set removals', () => {
    const original = { keywords: { important: true, urgent: true } };
    const modified = { keywords: { important: true } };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'keywords/urgent': null,
    });
  });

  it('handles mixed set changes', () => {
    const original = { keywords: { important: true, draft: true } };
    const modified = { keywords: { important: true, urgent: true } };
    const patch = calculateJmapPatch(original, modified);
    expect(patch).toEqual({
      'keywords/draft': null,
      'keywords/urgent': true,
    });
  });

  it('detects objectList item additions', () => {
    const original = {
      emailAddresses: {
        '0': { email: 'a@test.com', type: 'work' },
      },
    };
    const modified = {
      emailAddresses: {
        '0': { email: 'a@test.com', type: 'work' },
        '1': { email: 'b@test.com', type: 'home' },
      },
    };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'emailAddresses/1': { email: 'b@test.com', type: 'home' },
    });
  });

  it('detects objectList item removals', () => {
    const original = {
      emailAddresses: {
        '0': { email: 'a@test.com', type: 'work' },
        '1': { email: 'b@test.com', type: 'home' },
      },
    };
    const modified = {
      emailAddresses: {
        '0': { email: 'a@test.com', type: 'work' },
      },
    };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'emailAddresses/1': null,
    });
  });

  it('detects objectList item field updates', () => {
    const original = {
      emailAddresses: {
        '0': { email: 'a@test.com', type: 'work' },
      },
    };
    const modified = {
      emailAddresses: {
        '0': { email: 'a@test.com', type: 'home' },
      },
    };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'emailAddresses/0/type': 'home',
    });
  });

  it('detects map key additions', () => {
    const original = { mailboxIds: { inbox1: true } };
    const modified = { mailboxIds: { inbox1: true, sent1: true } };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'mailboxIds/sent1': true,
    });
  });

  it('detects map key removals', () => {
    const original = { mailboxIds: { inbox1: true, sent1: true } };
    const modified = { mailboxIds: { inbox1: true } };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'mailboxIds/sent1': null,
    });
  });

  it('detects map value changes', () => {
    const original = { settings: { theme: 'dark' } };
    const modified = { settings: { theme: 'light' } };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'settings/theme': 'light',
    });
  });

  it('handles map with object values', () => {
    const original = {
      accounts: {
        acc1: { name: 'Account 1', isActive: true },
      },
    };
    const modified = {
      accounts: {
        acc1: { name: 'Account 1', isActive: false },
      },
    };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'accounts/acc1/isActive': false,
    });
  });

  it('handles map with nested object value additions', () => {
    const original = { accounts: {} };
    const modified = {
      accounts: {
        acc1: { name: 'Account 1', isActive: true },
      },
    };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'accounts/acc1': { name: 'Account 1', isActive: true },
    });
  });

  it('includes @type in patch', () => {
    const original = { '@type': 'Mailbox', name: 'Inbox' };
    const modified = { '@type': 'MailboxChanged', name: 'Inbox' };
    expect(calculateJmapPatch(original, modified)).toEqual({
      '@type': 'MailboxChanged',
    });
  });

  it('does not include @type when unchanged', () => {
    const original = { '@type': 'Mailbox', name: 'Inbox' };
    const modified = { '@type': 'Mailbox', name: 'Sent' };
    expect(calculateJmapPatch(original, modified)).toEqual({
      name: 'Sent',
    });
  });

  it('does not null out fields from the previous variant on top-level @type change', () => {
    const original = {
      '@type': 'MaxMind',
      asnUrls: ['https://example.com/asn.csv'],
      expires: 86400,
      geoUrls: ['https://example.com/geo.csv'],
      httpAuth: null,
      httpHeaders: {},
      maxSize: 104857600,
      timeout: 30000,
    };
    const modified = { '@type': 'Disabled' };
    expect(calculateJmapPatch(original, modified)).toEqual({
      '@type': 'Disabled',
    });
  });

  it("includes the new variant's defaults on top-level @type change", () => {
    const original = {
      '@type': 'VariantA',
      onlyOnA: 'x',
      shared: 1,
    };
    const modified = {
      '@type': 'VariantB',
      onlyOnB: 'y',
      shared: 2,
    };
    expect(calculateJmapPatch(original, modified)).toEqual({
      '@type': 'VariantB',
      onlyOnB: 'y',
      shared: 2,
    });
  });

  it('replaces nested object atomically when its @type changes', () => {
    const original = {
      certificateManagement: { '@type': 'Manual' },
    };
    const modified = {
      certificateManagement: {
        '@type': 'Automatic',
        acmeProviderId: 'letsencrypt',
        subjectAlternativeNames: { example: true },
      },
    };
    expect(calculateJmapPatch(original, modified)).toEqual({
      certificateManagement: {
        '@type': 'Automatic',
        acmeProviderId: 'letsencrypt',
        subjectAlternativeNames: { example: true },
      },
    });
  });

  it('does not produce nested/@type patch entries on variant change', () => {
    const original = {
      dnsManagement: { '@type': 'Manual' },
    };
    const modified = {
      dnsManagement: {
        '@type': 'Automatic',
        publishRecords: { dkim: true, mx: true },
      },
    };
    const patch = calculateJmapPatch(original, modified);
    expect(Object.keys(patch)).toEqual(['dnsManagement']);
    expect(patch['dnsManagement/@type']).toBeUndefined();
    expect(patch['dnsManagement/publishRecords']).toBeUndefined();
  });

  it('patches nested object properties normally when @type is unchanged', () => {
    const original = {
      dnsManagement: {
        '@type': 'Automatic',
        publishRecords: { dkim: true, mx: false },
      },
    };
    const modified = {
      dnsManagement: {
        '@type': 'Automatic',
        publishRecords: { dkim: true, mx: true },
      },
    };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'dnsManagement/publishRecords/mx': true,
    });
  });

  it('replaces atomically when @type appears in modified but not original', () => {
    const original = {
      certificateManagement: {},
    };
    const modified = {
      certificateManagement: { '@type': 'Automatic', acmeProviderId: 'le' },
    };
    expect(calculateJmapPatch(original, modified)).toEqual({
      certificateManagement: { '@type': 'Automatic', acmeProviderId: 'le' },
    });
  });

  it('replaces atomically when @type appears in original but not modified', () => {
    const original = {
      certificateManagement: { '@type': 'Manual' },
    };
    const modified = {
      certificateManagement: {},
    };
    expect(calculateJmapPatch(original, modified)).toEqual({
      certificateManagement: {},
    });
  });

  it('handles deeply nested variant change (inside another nested object)', () => {
    const original = {
      model: {
        outer: 'constant',
        inner: { '@type': 'TypeA', a: 1 },
      },
    };
    const modified = {
      model: {
        outer: 'constant',
        inner: { '@type': 'TypeB', b: 2 },
      },
    };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'model/inner': { '@type': 'TypeB', b: 2 },
    });
  });

  it('only replaces the variant-changed sub-object, not siblings', () => {
    const original = {
      a: { '@type': 'X' },
      b: { foo: 'bar' },
      c: 1,
    };
    const modified = {
      a: { '@type': 'Y', value: 42 },
      b: { foo: 'baz' },
      c: 2,
    };
    expect(calculateJmapPatch(original, modified)).toEqual({
      a: { '@type': 'Y', value: 42 },
      'b/foo': 'baz',
      c: 2,
    });
  });

  it('ignores id field', () => {
    const original = { id: '123', name: 'Alice' };
    const modified = { id: '456', name: 'Bob' };
    expect(calculateJmapPatch(original, modified)).toEqual({
      name: 'Bob',
    });
  });

  it('ignores id field even when added', () => {
    const original = { name: 'Alice' };
    const modified = { id: '123', name: 'Alice' };
    expect(calculateJmapPatch(original, modified)).toEqual({});
  });

  it('ignores id field even when removed', () => {
    const original = { id: '123', name: 'Alice' };
    const modified = { name: 'Alice' };
    expect(calculateJmapPatch(original, modified)).toEqual({});
  });

  it('handles null to value', () => {
    const original = { name: null };
    const modified = { name: 'Alice' };
    expect(calculateJmapPatch(original, modified)).toEqual({
      name: 'Alice',
    });
  });

  it('handles value to null', () => {
    const original = { name: 'Alice' };
    const modified = { name: null };
    expect(calculateJmapPatch(original, modified)).toEqual({
      name: null,
    });
  });

  it('treats arrays as atomic', () => {
    const original = { tags: ['a', 'b'] };
    const modified = { tags: ['a', 'c'] };
    expect(calculateJmapPatch(original, modified)).toEqual({
      tags: ['a', 'c'],
    });
  });

  it('returns empty for identical arrays', () => {
    const original = { tags: ['a', 'b'] };
    const modified = { tags: ['a', 'b'] };
    expect(calculateJmapPatch(original, modified)).toEqual({});
  });

  it('handles empty objects', () => {
    const original = { data: {} };
    const modified = { data: {} };
    expect(calculateJmapPatch(original, modified)).toEqual({});
  });

  it('handles transition from primitive to object', () => {
    const original = { field: 'string' };
    const modified = { field: { nested: true } };
    expect(calculateJmapPatch(original, modified)).toEqual({
      field: { nested: true },
    });
  });

  it('handles transition from object to primitive', () => {
    const original = { field: { nested: true } };
    const modified = { field: 'string' };
    expect(calculateJmapPatch(original, modified)).toEqual({
      field: 'string',
    });
  });

  it('handles transition from array to object', () => {
    const original = { field: [1, 2, 3] };
    const modified = { field: { key: 'value' } };
    expect(calculateJmapPatch(original, modified)).toEqual({
      field: { key: 'value' },
    });
  });

  it('handles transition from object to array', () => {
    const original = { field: { key: 'value' } };
    const modified = { field: [1, 2, 3] };
    expect(calculateJmapPatch(original, modified)).toEqual({
      field: [1, 2, 3],
    });
  });

  describe('escapeJsonPointerToken', () => {
    it('escapes tilde', () => {
      expect(escapeJsonPointerToken('a~b')).toBe('a~0b');
    });
    it('escapes slash', () => {
      expect(escapeJsonPointerToken('a/b')).toBe('a~1b');
    });
    it('escapes both, tilde first', () => {
      expect(escapeJsonPointerToken('a~/b')).toBe('a~0~1b');
    });
    it('leaves unrelated characters alone', () => {
      expect(escapeJsonPointerToken('plain')).toBe('plain');
    });
  });

  it('escapes user-supplied map keys containing slashes in patches', () => {
    const original = { headers: { 'X-Plain': 'old' } };
    const modified = { headers: { 'X-Plain': 'old', 'X/Slashed': 'value' } };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'headers/X~1Slashed': 'value',
    });
  });

  it('escapes user-supplied map keys containing tildes in patches', () => {
    const original = { headers: {} };
    const modified = { headers: { 'with~tilde': 'yes' } };
    expect(calculateJmapPatch(original, modified)).toEqual({
      'headers/with~0tilde': 'yes',
    });
  });

  it('handles multiple changes at different nesting levels', () => {
    const original = {
      name: 'Test',
      nested: {
        a: 1,
        b: { c: 2, d: 3 },
      },
      other: 'unchanged',
    };
    const modified = {
      name: 'Updated',
      nested: {
        a: 1,
        b: { c: 99, d: 3 },
      },
      other: 'unchanged',
    };
    expect(calculateJmapPatch(original, modified)).toEqual({
      name: 'Updated',
      'nested/b/c': 99,
    });
  });
});
