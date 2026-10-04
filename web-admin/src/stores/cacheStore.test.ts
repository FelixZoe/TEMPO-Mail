/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useCacheStore } from './cacheStore';

describe('cacheStore', () => {
  beforeEach(() => {
    useCacheStore.setState({ displayNames: {} });
  });

  describe('setDisplayNames', () => {
    it('stores entries for an object type', () => {
      useCacheStore.getState().setDisplayNames('user', { u1: 'Alice', u2: 'Bob' });

      expect(useCacheStore.getState().displayNames).toEqual({
        user: { u1: 'Alice', u2: 'Bob' },
      });
    });

    it('merges with existing entries for the same object type', () => {
      const { setDisplayNames } = useCacheStore.getState();
      setDisplayNames('user', { u1: 'Alice' });
      setDisplayNames('user', { u2: 'Bob' });

      expect(useCacheStore.getState().displayNames.user).toEqual({
        u1: 'Alice',
        u2: 'Bob',
      });
    });

    it('overwrites individual entries when keys collide', () => {
      const { setDisplayNames } = useCacheStore.getState();
      setDisplayNames('user', { u1: 'Alice' });
      setDisplayNames('user', { u1: 'Alicia' });

      expect(useCacheStore.getState().displayNames.user.u1).toBe('Alicia');
    });
  });

  describe('getDisplayName', () => {
    it('returns cached name', () => {
      useCacheStore.getState().setDisplayNames('user', { u1: 'Alice' });
      expect(useCacheStore.getState().getDisplayName('user', 'u1')).toBe('Alice');
    });

    it('returns undefined for unknown id', () => {
      useCacheStore.getState().setDisplayNames('user', { u1: 'Alice' });
      expect(useCacheStore.getState().getDisplayName('user', 'u99')).toBeUndefined();
    });

    it('returns undefined for unknown object type', () => {
      expect(useCacheStore.getState().getDisplayName('domain', 'd1')).toBeUndefined();
    });
  });

  describe('invalidateCache', () => {
    it('removes entries for a specific object type', () => {
      const { setDisplayNames } = useCacheStore.getState();
      setDisplayNames('user', { u1: 'Alice' });
      setDisplayNames('domain', { d1: 'example.com' });

      useCacheStore.getState().invalidateCache('user');

      const state = useCacheStore.getState();
      expect(state.displayNames.user).toBeUndefined();
      expect(state.displayNames.domain).toEqual({ d1: 'example.com' });
    });

    it('is a no-op when object type does not exist', () => {
      useCacheStore.getState().setDisplayNames('user', { u1: 'Alice' });
      useCacheStore.getState().invalidateCache('nonexistent');

      expect(useCacheStore.getState().displayNames.user).toEqual({ u1: 'Alice' });
    });
  });

  describe('multiple object types', () => {
    it('stores different object types independently', () => {
      const { setDisplayNames } = useCacheStore.getState();
      setDisplayNames('user', { u1: 'Alice' });
      setDisplayNames('domain', { d1: 'example.com' });
      setDisplayNames('group', { g1: 'Admins' });

      const state = useCacheStore.getState();
      expect(state.getDisplayName('user', 'u1')).toBe('Alice');
      expect(state.getDisplayName('domain', 'd1')).toBe('example.com');
      expect(state.getDisplayName('group', 'g1')).toBe('Admins');
    });
  });
});
