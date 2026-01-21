'use client';

import React from 'react';
import {
  Feather,
  Cpu,
  Radio,
  Database,
  Shield,
  Zap,
  ArrowLeft,
} from 'lucide-react';

export default function AboutPageContent() {
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
            <Feather className="h-4 w-4" />
            About the System
          </span>

          <h1 className="text-5xl font-bold tracking-tight">
            AutoFeather
            <span className="block text-2xl text-muted-foreground mt-2">
              Feather Density & Thermal Comfort Fertility Predictor
            </span>
          </h1>

          <p className="max-w-3xl text-muted-foreground leading-relaxed">
            AutoFeather is an intelligent poultry decision-support system that
            evaluates environmental and physiological parameters to predict
            fertility outcomes. The system applies fuzzy logic inference to
            feather density and thermal comfort data for accurate and adaptive
            analysis.
          </p>
        </header>

        {/* Mission */}
        <section className="border border-border bg-card p-8 space-y-4">
          <h2 className="text-2xl font-semibold flex items-center gap-3">
            <span className="h-6 w-1 bg-primary" />
            System Objective
          </h2>

          <p className="text-muted-foreground leading-relaxed">
            The primary objective of AutoFeather is to assist poultry farmers,
            researchers, and farm managers in optimizing breeding conditions by
            providing real-time fertility predictions based on thermal comfort
            and feather density indicators. The system promotes data-driven,
            efficient, and welfare-oriented poultry management.
          </p>
        </section>

        {/* Technology Stack */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Technology Stack</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <TechCard
              icon={<Cpu />}
              title="Processing Unit"
              desc="Microcontroller-based data acquisition and preprocessing for sensor inputs."
            />
            <TechCard
              icon={<Radio />}
              title="Sensor Integration"
              desc="Environmental and physiological sensors for temperature and feather density inputs."
            />
            <TechCard
              icon={<Database />}
              title="Data Management"
              desc="Structured data storage for historical analysis and model validation."
            />
            <TechCard
              icon={<Shield />}
              title="Fuzzy Logic Engine"
              desc="Rule-based inference system translating inputs into linguistic fertility outputs."
            />
            <TechCard
              icon={<Zap />}
              title="Decision Support"
              desc="Real-time evaluation enabling proactive environmental adjustments."
            />
            <TechCard
              icon={<Feather />}
              title="User Interface"
              desc="Minimal web interface designed for clarity, accessibility, and analysis."
            />
          </div>
        </section>

        {/* Benefits */}
        <section className="border border-border bg-card p-8 space-y-8">
          <h2 className="text-2xl font-semibold">Why Use AutoFeather?</h2>

          <div className="grid md:grid-cols-2 gap-8">
            <Benefit
              title="Improved Fertility Outcomes"
              desc="Early detection of unfavorable thermal and physiological conditions."
            />
            <Benefit
              title="Data-Driven Decisions"
              desc="Objective analysis replaces guesswork in poultry management."
            />
            <Benefit
              title="Animal Welfare Focused"
              desc="Thermal comfort evaluation supports healthier living conditions."
            />
            <Benefit
              title="Research-Oriented Design"
              desc="Suitable for academic studies, experiments, and system validation."
            />
            <Benefit
              title="Reduced Operational Risk"
              desc="Predictive insights help prevent productivity losses."
            />
            <Benefit
              title="Scalable Architecture"
              desc="Can be extended with additional inputs and fuzzy rules."
            />
          </div>
        </section>
      </div>
    </section>
  );
}

/* ---------- Components ---------- */

function TechCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="border border-border bg-secondary p-6 space-y-4">
      <div className="text-muted-foreground">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function Benefit({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}
