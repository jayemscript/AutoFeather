'use client';

import React from 'react';
import {
  ArrowLeft,
  Feather,
  Thermometer,
  Gauge,
  Activity,
  Zap,
  Bell,
  BarChart3,
  Brain,
} from 'lucide-react';

export default function DocumentationPageContent() {
  return (
    <section className="min-h-screen bg-background text-foreground px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Back */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </a>

        {/* Header */}
        <header className="space-y-6">
          <span className="inline-flex items-center gap-2 border border-border bg-secondary px-4 py-1 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            Documentation
          </span>

          <h1 className="text-5xl font-bold tracking-tight">
            System Documentation
            <span className="block text-2xl text-muted-foreground mt-2">
              AutoFeather – Fuzzy Logic Fertility Prediction System
            </span>
          </h1>

          <p className="max-w-3xl text-muted-foreground leading-relaxed">
            This section documents the core functionality, system components,
            and operational flow of AutoFeather. The platform evaluates poultry
            fertility conditions by processing feather density and thermal
            comfort data using fuzzy logic inference.
          </p>
        </header>

        {/* Core Functions */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Core System Functions</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <DocCard
              icon={<Feather />}
              title="Feather Density Evaluation"
              desc="Analyzes feather coverage as a physiological indicator influencing thermal regulation and fertility performance."
              items={[
                'Image-based or indexed feather density input',
                'Linguistic classification (Low, Medium, High)',
                'Used as a primary fuzzy input variable',
              ]}
            />

            <DocCard
              icon={<Thermometer />}
              title="Thermal Comfort Assessment"
              desc="Evaluates ambient temperature conditions affecting poultry stress levels and reproductive efficiency."
              items={[
                'Environmental temperature sensing',
                'Mapped to thermal comfort membership functions',
                'Supports welfare-oriented decisions',
              ]}
            />

            <DocCard
              icon={<Brain />}
              title="Fuzzy Logic Inference"
              desc="Processes input variables through a rule-based fuzzy inference engine."
              items={[
                'IF–THEN fuzzy rules',
                'Mamdani-style inference',
                'Defuzzification for numeric output',
              ]}
            />

            <DocCard
              icon={<Gauge />}
              title="Fertility Prediction Output"
              desc="Produces a fertility index or probability based on evaluated conditions."
              items={[
                'Numerical fertility score',
                'Linguistic interpretation',
                'Decision-support ready',
              ]}
            />
          </div>
        </section>

        {/* Data & Alerts */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">
            Data Handling & Notifications
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <DocCard
              icon={<BarChart3 />}
              title="Data Visualization & History"
              desc="Displays real-time outputs and historical trends for analysis and validation."
              items={[
                'Live system readings',
                'Historical fertility trends',
                'Exportable datasets',
              ]}
            />

            <DocCard
              icon={<Bell />}
              title="Threshold Alerts"
              desc="Notifies users when system inputs or outputs exceed predefined thresholds."
              items={[
                'Custom alert conditions',
                'Early risk indication',
                'Supports proactive intervention',
              ]}
            />
          </div>
        </section>

        {/* How It Works */}
        <section className="border border-border bg-card p-10 space-y-8">
          <h2 className="text-2xl font-semibold text-center">
            System Workflow
          </h2>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Step
              step="1"
              title="Data Acquisition"
              desc="Sensors or input modules collect feather density and environmental temperature data."
            />
            <Step
              step="2"
              title="Fuzzy Evaluation"
              desc="Input values are fuzzified and processed using predefined inference rules."
            />
            <Step
              step="3"
              title="Decision Output"
              desc="The system generates a fertility prediction and optional alerts for user action."
            />
          </div>
        </section>
      </div>
    </section>
  );
}

/* ---------- Components ---------- */

function DocCard({
  icon,
  title,
  desc,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  items: string[];
}) {
  return (
    <div className="border border-border bg-secondary p-6 space-y-4">
      <div className="text-muted-foreground">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Step({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="space-y-3">
      <div className="mx-auto h-12 w-12 border border-border flex items-center justify-center font-semibold">
        {step}
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
