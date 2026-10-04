/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import { createContext, useContext } from 'react';
import { useAccountStore } from '@/stores/accountStore';

export type EditionValue = 'enterprise' | 'community' | 'oss';

export const FormEditionContext = createContext<EditionValue | null>(null);

export function useEffectiveEdition(): EditionValue {
  const override = useContext(FormEditionContext);
  const storeEdition = useAccountStore((s) => s.edition);
  return override ?? storeEdition;
}
