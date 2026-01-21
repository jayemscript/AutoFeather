'use client';

import React from 'react';
import {
  ArrowLeft,
  Brain,
  Sigma,
  GitBranch,
  Sliders,
  Calculator,
} from 'lucide-react';

export default function ModelPageContent() {
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
            <Brain className="h-4 w-4" />
            Fuzzy Logic Model
          </span>

          <h1 className="text-5xl font-bold tracking-tight">
            Fuzzy Logic Inference Model
            <span className="block text-2xl text-muted-foreground mt-2">
              Fertility Prediction Framework
            </span>
          </h1>

          <p className="max-w-3xl text-muted-foreground leading-relaxed">
            This page describes the fuzzy logic model used in AutoFeather. The
            model applies rule-based reasoning to handle uncertainty and
            imprecision in biological and environmental fertility factors.
          </p>
        </header>

        {/* Why Fuzzy Logic */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Why Fuzzy Logic</h2>

          <div className="border border-border bg-card p-8 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              Poultry fertility is influenced by gradual, non-linear factors
              such as feather density and thermal comfort. Traditional binary or
              statistical models are limited when dealing with vague or
              overlapping conditions.
            </p>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Handles uncertainty and partial truth</li>
              <li>• Mimics human expert reasoning</li>
              <li>• Suitable for biological and environmental systems</li>
            </ul>
          </div>
        </section>

        {/* Model Components */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Model Components</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <ModelCard
              icon={<Sliders />}
              title="Input Variables"
              desc="Crisp numerical inputs collected from sensors or manual observation."
              items={[
                'Feather Density',
                'Ambient Temperature',
                'Environmental Comfort Indicators',
              ]}
            />

            <ModelCard
              icon={<Sigma />}
              title="Fuzzification"
              desc="Transforms crisp inputs into fuzzy linguistic variables using membership functions."
              items={[
                'Low / Medium / High feather density',
                'Cold / Optimal / Hot temperature',
                'Degree of membership between 0 and 1',
              ]}
            />

            <ModelCard
              icon={<GitBranch />}
              title="Rule Base"
              desc="A collection of IF–THEN rules derived from expert knowledge."
              items={[
                'IF feather density is High AND temperature is Optimal',
                'THEN fertility is High',
                'Supports multiple rule activations',
              ]}
            />

            <ModelCard
              icon={<Calculator />}
              title="Defuzzification"
              desc="Converts fuzzy outputs into a single numerical fertility score."
              items={[
                'Centroid method',
                'Produces crisp fertility index',
                'Used for decision support',
              ]}
            />
          </div>
        </section>

        {/* Inference Process */}
        <section className="border border-border bg-secondary p-10 space-y-8">
          <h2 className="text-2xl font-semibold text-center">
            Fuzzy Inference Process
          </h2>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <Step
              step="1"
              title="Input"
              desc="Raw sensor or observational data are collected."
            />
            <Step
              step="2"
              title="Fuzzification"
              desc="Inputs are mapped to linguistic terms using membership functions."
            />
            <Step
              step="3"
              title="Inference"
              desc="Rules are evaluated using Mamdani-style fuzzy inference."
            />
            <Step
              step="4"
              title="Defuzzification"
              desc="The aggregated fuzzy output is converted to a crisp fertility score."
            />
          </div>
        </section>

        {/* Output Interpretation */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Output Interpretation</h2>

          <div className="border border-border bg-card p-8 space-y-4">
            <p className="text-muted-foreground leading-relaxed">
              The final output is a fertility index that represents the overall
              reproductive condition of the poultry under observed environmental
              and physiological factors.
            </p>

            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Low fertility: unfavorable conditions detected</li>
              <li>• Moderate fertility: acceptable but improvable</li>
              <li>• High fertility: optimal reproductive environment</li>
            </ul>
          </div>
        </section>
      </div>
    </section>
  );
}

/* ---------- Components ---------- */

function ModelCard({
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
