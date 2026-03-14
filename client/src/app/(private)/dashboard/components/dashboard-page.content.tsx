'use client';

import React from 'react';
import Image from 'next/image';
import { useAuthCheck } from '@/hooks/use-auth-check.hooks';
import { formatDate } from '@syntaxsentinel/date-utils';
import PredictTable from './prediction/predict-table';
import Analytics from './prediction/analytics';

export default function DashboardPageContent() {
  const { user } = useAuthCheck();

  return (
    <div className="p-6">
      <div className="w-full">
        {/* ── Header — centered ── */}
        <div className="flex flex-col items-center text-center gap-3 py-8">
          <div>
            <p className="text-2xl font-bold leading-tight">AutoFeather</p>
            <p className="text-sm font-medium text-primary mt-0.5">
              Predict Fertility Precisely.
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mt-1 leading-relaxed">
              Evaluates feather density and thermal comfort through a fuzzy
              logic inference model — turning raw poultry sensor data into
              actionable fertility forecasts.
            </p>
          </div>

          <div className="mt-2 pt-4 border-t w-full max-w-sm">
            <h2 className="text-lg font-semibold capitalize">
              Welcome, {user?.username || 'User'}
            </h2>
            <p className="text-sm text-muted-foreground">
              Here's an overview of your dashboard — as of{' '}
              {formatDate.longDate(new Date())}
            </p>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="m-5 p-5 space-y-4">
          <Analytics />
          <PredictTable />
        </div>
      </div>
    </div>
  );
}
