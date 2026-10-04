/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import { useAccountStore } from '@/stores/accountStore';
import { useSchemaStore } from '@/stores/schemaStore';
import { resolveObject } from '@/lib/schemaResolver';

export function usePermissions() {
  const { permissions, edition, hasPermission, hasObjectPermission } = useAccountStore();
  const schema = useSchemaStore((s) => s.schema);

  function canViewObject(viewName: string): boolean {
    if (!schema) return false;
    const resolved = resolveObject(schema, viewName);
    if (!resolved) return false;
    return hasObjectPermission(resolved.permissionPrefix, 'Get');
  }

  function canCreateObject(viewName: string): boolean {
    if (!schema) return false;
    const resolved = resolveObject(schema, viewName);
    if (!resolved) return false;
    if (resolved.objectType.type === 'singleton') return false;
    return hasObjectPermission(resolved.permissionPrefix, 'Create');
  }

  function canUpdateObject(viewName: string): boolean {
    if (!schema) return false;
    const resolved = resolveObject(schema, viewName);
    if (!resolved) return false;
    return hasObjectPermission(resolved.permissionPrefix, 'Update');
  }

  function canDestroyObject(viewName: string): boolean {
    if (!schema) return false;
    const resolved = resolveObject(schema, viewName);
    if (!resolved) return false;
    if (resolved.objectType.type === 'singleton') return false;
    return hasObjectPermission(resolved.permissionPrefix, 'Destroy');
  }

  function isEnterpriseHidden(enterprise?: boolean): boolean {
    if (!enterprise) return false;
    return edition === 'oss';
  }

  function isEnterpriseDisabled(enterprise?: boolean): boolean {
    if (!enterprise) return false;
    return edition === 'community';
  }

  return {
    permissions,
    edition,
    hasPermission,
    hasObjectPermission,
    canViewObject,
    canCreateObject,
    canUpdateObject,
    canDestroyObject,
    isEnterpriseHidden,
    isEnterpriseDisabled,
  };
}
