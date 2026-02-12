'use client';

import React from 'react';
import {
  Feather,
  Thermometer,
  Gauge,
  Activity,
  ChevronRight,
} from 'lucide-react';
import { ThemeButtons } from '@/components/customs/theme-buttons';

export default function HomeSection() {
  return (
    <section className="min-h-screen bg-background/70 text-foreground flex items-center justify-center px-6">
      <div className="w-full max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Description */}
          <div className="space-y-10">
            <div className="flex justify-end">
              <ThemeButtons />
            </div>

            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 border border-border bg-secondary px-4 py-1 text-sm text-muted-foreground">
                <span className="h-2 w-2 bg-primary" />
                Fuzzy Logic Decision Support System
              </span>

              <h1 className="text-5xl font-bold leading-tight tracking-tight">
                AutoFeather
                <span className="block  mt-2 text-3xl">
                  Feather Density & Thermal Comfort Fertility Predictor
                </span>
              </h1>

              <p className="max-w-xl leading-relaxed">
                AutoFeather is an intelligent poultry analytics platform that
                predicts fertility outcomes by evaluating feather density and
                thermal comfort using a fuzzy logic inference model.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-md">
              <NavButton href="/about" label="System Overview" />
              <NavButton href="/model" label="Fuzzy Model" />
              <NavButton href="/documentation" label="Documentation" />

              <a
                href="/login"
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground font-medium py-3"
              >
                Access System
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right: Output Panel */}
          <div className="border border-border bg-card p-8 space-y-8">
            <header className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Real-Time System Output</h2>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 bg-primary" />
                Evaluating
              </span>
            </header>

            <div className="space-y-4">
              <Metric
                icon={<Feather className="h-6 w-6" />}
                label="Feather Density Index"
                value="0.78"
              />

              <Metric
                icon={<Thermometer className="h-6 w-6" />}
                label="Thermal Comfort Level"
                value="Optimal"
              />

              <Metric
                icon={<Gauge className="h-6 w-6" />}
                label="Predicted Fertility Rate"
                value="86%"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------- Components ---------- */

function NavButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="border border-border bg-secondary py-3 text-center text-sm text-foreground hover:bg-accent transition"
    >
      {label}
    </a>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border border-border bg-secondary px-5 py-4">
      <div className="flex items-center gap-4">
        <div className="text-muted-foreground">{icon}</div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold">{value}</p>
        </div>
      </div>
      <Activity className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}
