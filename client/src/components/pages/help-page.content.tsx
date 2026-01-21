'use client';
import React from 'react';
import {
  ArrowLeft,
  Thermometer,
  Droplets,
  Activity,
  Waves,
  Circle,
  AlertCircle,
} from 'lucide-react';

export default function HelpPageContent() {
  return (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] p-4 sm:p-6 lg:p-8 font-mono">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </a>

        {/* Header */}
        <div className="mb-16">
          <div className="inline-flex items-center gap-2 bg-[var(--color-primary)]/20 text-[var(--color-primary)] px-4 py-2 rounded-full text-sm font-medium mb-6 border border-[var(--color-border)]">
            <AlertCircle className="h-4 w-4" />
            How to Use
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold mb-6">
            AutoFeather
            <span className="block text-[var(--color-primary)] mt-2 font-bold text-2xl">
              Monitoring Modules Guide
            </span>
          </h1>
          <p className="text-lg text-[var(--color-muted-foreground)] leading-relaxed max-w-3xl">
            Learn how to use AutoFeather modules to track feather density,
            thermal comfort, egg fertility, and automate environmental controls
            efficiently.
          </p>
        </div>

        {/* Monitoring Modules */}
        <div className="space-y-8">
          <ModuleCard
            icon={Activity}
            title="Feather Density Monitoring"
            description="Automatically tracks feather growth and coverage to ensure bird health."
            optimal="Healthy coverage, no bare patches"
            alert="Alerts if feather loss exceeds 10% of body coverage"
            tips={[
              'Check feather density daily during molting season',
              'Sudden feather loss may indicate stress or disease',
              'Use automated notifications to respond quickly',
            ]}
          />

          <ModuleCard
            icon={Thermometer}
            title="Thermal Comfort Monitoring"
            description="Monitors poultry house temperature in real-time to maintain optimal comfort."
            optimal="20°C - 25°C"
            alert="Alerts if temperature exceeds 28°C or drops below 18°C"
            tips={[
              'Adjust heaters or fans according to alerts',
              'Ensure birds are evenly distributed to prevent hot/cold zones',
              'Track daily temperature trends for optimization',
            ]}
          />

          <ModuleCard
            icon={Droplets}
            title="Egg Fertility & Production"
            description="Tracks egg laying patterns, fertility predictions, and incubation conditions."
            optimal="Consistent laying, high fertility"
            alert="Alerts if egg production drops >10% or fertility declines"
            tips={[
              'Check incubators daily for temperature and humidity',
              'Adjust lighting schedules to maintain laying cycles',
              'Monitor trends to improve breeding outcomes',
            ]}
          />

          <ModuleCard
            icon={Waves}
            title="Automated Environmental Controls"
            description="Automates ventilation, lighting, and feed/water systems for optimal poultry house management."
            optimal="Stable environment based on bird age and season"
            alert="Alerts if automated systems fail or deviate from setpoints"
            tips={[
              'Inspect sensors and actuators regularly',
              'Ensure backup systems are operational',
              'Customize thresholds based on species and age',
            ]}
          />
        </div>

        {/* Quick Reference Table */}
        <QuickReference />
      </div>
    </div>
  );
}

/* Module Card */
function ModuleCard({ icon: Icon, title, description, optimal, alert, tips }) {
  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="p-4 bg-[var(--color-secondary)] rounded-lg">
          <Icon className="h-8 w-8 text-[var(--color-primary)]" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2 text-[var(--color-card-foreground)]">
            {title}
          </h2>
          <p className="text-[var(--color-muted-foreground)] mb-4">
            {description}
          </p>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="bg-[var(--color-secondary)] p-4 rounded-lg border border-[var(--color-border)]">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Circle className="h-3 w-3 text-[var(--color-primary)]" />
                Optimal Range
              </h3>
              <p className="text-[var(--color-muted-foreground)]">{optimal}</p>
            </div>
            <div className="bg-[var(--color-secondary)] p-4 rounded-lg border border-[var(--color-border)]">
              <h3 className="font-semibold mb-1 flex items-center gap-2">
                <Circle className="h-3 w-3 text-[var(--color-primary)]" />
                Alert Threshold
              </h3>
              <p className="text-[var(--color-muted-foreground)]">{alert}</p>
            </div>
          </div>
          <div className="bg-[var(--color-accent)] p-4 rounded-lg border border-[var(--color-border)]">
            <h3 className="font-semibold mb-2">Usage Tips:</h3>
            <ul className="list-disc pl-5 text-[var(--color-muted-foreground)] space-y-1">
              {tips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Quick Reference Table */
function QuickReference() {
  return (
    <div className="mt-8 bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4 text-[var(--color-card-foreground)]">
        Quick Reference Guide
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="pb-2 pr-4 text-[var(--color-muted-foreground)] font-semibold">
                Parameter
              </th>
              <th className="pb-2 pr-4 text-[var(--color-muted-foreground)] font-semibold">
                Optimal Range
              </th>
              <th className="pb-2 text-[var(--color-muted-foreground)] font-semibold">
                Critical Action
              </th>
            </tr>
          </thead>
          <tbody className="text-[var(--color-muted-foreground)]">
            <tr className="border-b border-[var(--color-border)]">
              <td className="py-2 pr-4">Feather Density</td>
              <td className="py-2 pr-4">Healthy coverage, no bare patches</td>
              <td className="py-2">
                Investigate stress or disease if loss &gt;10%
              </td>
            </tr>
            <tr className="border-b border-[var(--color-border)]">
              <td className="py-2 pr-4">Temperature</td>
              <td className="py-2 pr-4">20°C - 25°C</td>
              <td className="py-2">
                Adjust heating/ventilation if outside range
              </td>
            </tr>
            <tr className="border-b border-[var(--color-border)]">
              <td className="py-2 pr-4">Egg Fertility</td>
              <td className="py-2 pr-4">Consistent laying, high fertility</td>
              <td className="py-2">Check incubators and lighting if drops</td>
            </tr>
            <tr>
              <td className="py-2 pr-4">Environmental Controls</td>
              <td className="py-2 pr-4">Stable, automated operation</td>
              <td className="py-2">Inspect sensors/actuators if failure</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
