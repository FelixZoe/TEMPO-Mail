/*
 * SPDX-FileCopyrightText: 2020 Stalwart Labs LLC <hello@stalw.art>
 *
 * SPDX-License-Identifier: AGPL-3.0-only OR LicenseRef-SEL
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Period, PresetKey } from '../types/metrics';

interface DashboardState {
  period: Period;
  setPeriod: (period: Period) => void;
  setPreset: (preset: PresetKey) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      period: { kind: 'preset', preset: '24h' } as Period,

      setPeriod: (period) => set({ period }),
      setPreset: (preset) => set({ period: { kind: 'preset', preset } }),
    }),
    {
      name: 'dashboard.period',
      partialize: (state) => ({ period: state.period }),
    },
  ),
);
