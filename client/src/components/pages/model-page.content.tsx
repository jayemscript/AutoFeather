'use client';

import React, { useState } from 'react';
import {
  ArrowLeft,
  Brain,
  Sigma,
  GitBranch,
  Sliders,
  Calculator,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function ModelPageContent() {
  return (
    <section className="min-h-screen bg-background text-foreground px-6 py-10 font-mono">
      <div className="max-w-5xl mx-auto space-y-20">
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
            <span className="block text-2xl text-muted-foreground mt-2 font-normal">
              Mamdani-style FIS · Fertility Prediction Framework
            </span>
          </h1>

          <p className="max-w-3xl text-muted-foreground leading-relaxed">
            This page explains the fuzzy logic model used in AutoFeather — including
            the actual formulas, membership functions, rule base, and defuzzification
            method implemented in the system.
          </p>
        </header>

        {/* STEP 1: INPUTS */}
        <Section icon={<Sliders />} label="Step 1" title="Inputs & Fuzzification">
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Two crisp inputs are collected and converted into fuzzy membership values.
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {/* FDS */}
            <div className="border border-border bg-secondary p-6 space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-widest">
                Feather Density Score (FDS)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Derived from YOLOv8 classification. Binary input converted to a numeric resilience score:
              </p>
              <CodeBlock>{`FDS = 0.75  // if density is HIGH (High Resilience)
FDS = 0.25  // if density is LOW  (Low Resilience)`}</CodeBlock>

              <p className="text-xs text-muted-foreground mt-2">
                FDS is then fuzzified into three linguistic variables using triangular membership functions:
              </p>
              <CodeBlock>{`μ_low(FDS)    = triangularMF(FDS, 0,    0,    0.4)
μ_medium(FDS) = triangularMF(FDS, 0.3,  0.55, 0.8)
μ_high(FDS)   = triangularMF(FDS, 0.7,  1,    1)`}</CodeBlock>
            </div>

            {/* TCI */}
            <div className="border border-border bg-secondary p-6 space-y-4">
              <h3 className="font-semibold text-sm uppercase tracking-widest">
                Thermal Comfort Index (TCI)
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Derived from temperature and optional humidity. Threshold: TCI ≥ 0.80 = High Heat Stress.
              </p>
              <CodeBlock>{`// With humidity:
TCI = tempStress × 0.7 + humidityStress × 0.3

// Without humidity:
TCI = tempStress`}</CodeBlock>
              <p className="text-xs text-muted-foreground">Temperature stress (optimal range 18–24°C):</p>
              <CodeBlock>{`if 18 ≤ temp ≤ 24:  stress = 0.2
if temp < 18:        stress = 0.2 + ((18 - temp) / 18) × 0.6
if temp > 24:        stress = 0.2 + ((temp - 24) / 16) × 0.8`}</CodeBlock>
            </div>
          </div>

          {/* Triangular MF Explainer */}
          <div className="border border-border bg-card p-6 space-y-3 mt-6">
            <h3 className="font-semibold text-sm uppercase tracking-widest">
              Triangular Membership Function (used for all variables)
            </h3>
            <p className="text-xs text-muted-foreground">
              Given parameters <code className="bg-secondary px-1">a, b, c</code> (and optional <code className="bg-secondary px-1">d</code> for trapezoidal):
            </p>
            <CodeBlock>{`μ(x) = 0              if x ≤ a or x ≥ d
μ(x) = (x - a)/(b-a)  if a < x < b
μ(x) = 1              if b ≤ x ≤ c
μ(x) = (d - x)/(d-c)  if c < x < d`}</CodeBlock>
            <p className="text-xs text-muted-foreground">
              Temperature example: <code className="bg-secondary px-1">cold = triangularMF(temp, 0, 0, 18, 22)</code>
            </p>
            <MembershipFunctionDiagram />
          </div>
        </Section>

        {/* STEP 2: RULE BASE */}
        <Section icon={<GitBranch />} label="Step 2" title="Fuzzy Rule Base (Minimum AND Operator)">
          <p className="text-muted-foreground text-sm leading-relaxed mb-2">
            Rules are evaluated using the <strong>Minimum (AND) operator</strong> — Equation 1:
          </p>
          <CodeBlock>{`α_i = min(μ_FDS(x), μ_TCI(y))`}</CodeBlock>
          <p className="text-xs text-muted-foreground mt-2 mb-6">
            Each rule's firing strength is the minimum membership value across its antecedents. Rules with strength = 0 are inactive.
          </p>

          <RuleTable />
        </Section>

        {/* STEP 3: DEFUZZIFICATION */}
        <Section icon={<Calculator />} label="Step 3" title="Centroid Defuzzification">
          <p className="text-muted-foreground text-sm leading-relaxed mb-2">
            The aggregated fuzzy output is converted into a crisp fertility score using the <strong>Centroid Method</strong> — Equation 2:
          </p>
          <CodeBlock>{`Z* = ∫ μC(z) · z dz  /  ∫ μC(z) dz`}</CodeBlock>
          <p className="text-xs text-muted-foreground mt-2 mb-6">
            Implemented as discrete approximation across 101 points (z = 0 to 100):
          </p>
          <CodeBlock>{`for z in 0..100:
  membershipAtZ = 0
  for each active rule:
    implied = min(rule_strength, triangularMF(z, center-width, center, center+width))
    membershipAtZ = max(membershipAtZ, implied)  // Aggregation (MAX)

  numerator   += membershipAtZ × z
  denominator += membershipAtZ

Z* = numerator / denominator  // Centroid = Fertility Score (0–100)`}</CodeBlock>

          <div className="mt-6 border border-border bg-secondary p-6 space-y-3">
            <h3 className="font-semibold text-sm uppercase tracking-widest">Output Fuzzy Sets (Rule Centers)</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Each rule maps to a triangular output set defined by center and width:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Rule</th>
                    <th className="text-left py-2 pr-4 text-muted-foreground font-medium">Center</th>
                    <th className="text-left py-2 text-muted-foreground font-medium">Width</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ['rule1: High Feather + Optimal Temp', '90', '±10'],
                    ['rule10: Perfect Conditions (+ Optimal Humidity)', '95', '±5'],
                    ['rule2: High Feather + Cold Temp', '70', '±15'],
                    ['rule4: Medium Feather + Optimal Temp', '65', '±15'],
                    ['rule3: High Feather + Hot Temp', '55', '±15'],
                    ['rule5: Medium Feather + Cold Temp', '50', '±15'],
                    ['rule6: Medium Feather + Hot Temp', '45', '±15'],
                    ['rule8: Low Feather + Optimal Temp', '40', '±15'],
                    ['rule7: Low Feather + Cold Temp', '25', '±15'],
                    ['rule9: Low Feather + Hot Temp', '20', '±15'],
                    ['rule11: Low Humidity Stress', '35', '±10'],
                    ['rule12: High Humidity Stress', '30', '±10'],
                    ['rule13: High Heat Stress (TCI ≥ 0.80)', '20', '±10'],
                  ].map(([rule, center, width]) => (
                    <tr key={rule}>
                      <td className="py-2 pr-4 text-foreground">{rule}</td>
                      <td className="py-2 pr-4 text-primary font-semibold">{center}%</td>
                      <td className="py-2 text-muted-foreground">{width}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* STEP 4: OUTPUT */}
        <Section icon={<Sigma />} label="Step 4" title="Output Interpretation">
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            The crisp fertility score Z* is categorized into a fertility level:
          </p>
          <CodeBlock>{`if Z* < 40:   fertilityLevel = "LOW"
if Z* < 70:   fertilityLevel = "MEDIUM"
else:         fertilityLevel = "HIGH"`}</CodeBlock>

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            {[
              { level: 'LOW', range: '0–39%', color: 'border-red-500/50 bg-red-500/5', desc: 'Unfavorable conditions. Low feather resilience or high thermal stress detected.' },
              { level: 'MEDIUM', range: '40–69%', color: 'border-yellow-500/50 bg-yellow-500/5', desc: 'Acceptable conditions. Some environmental or physiological stress present.' },
              { level: 'HIGH', range: '70–100%', color: 'border-green-500/50 bg-green-500/5', desc: 'Optimal reproductive environment. High feather density with favorable temperature.' },
            ].map(({ level, range, color, desc }) => (
              <div key={level} className={`border p-5 space-y-2 ${color}`}>
                <div className="font-bold text-lg">{level}</div>
                <div className="text-xs text-muted-foreground font-mono">{range}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Full Pipeline Summary */}
        <section className="border border-border bg-secondary p-10 space-y-8">
          <h2 className="text-2xl font-semibold text-center">Full Inference Pipeline</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <Step step="1" title="Fuzzification" desc="FDS + TCI crisp values → μ_low, μ_medium, μ_high via triangularMF()" />
            <Step step="2" title="Rule Evaluation" desc="α_i = min(antecedent memberships) across 9–13 IF-THEN rules" />
            <Step step="3" title="Implication" desc="min(α_i, μ_output(z)) applied per rule; aggregated by MAX" />
            <Step step="4" title="Defuzzification" desc="Z* = centroid of aggregated fuzzy set → crisp fertility score" />
          </div>
        </section>

      </div>
    </section>
  );
}

/* ---------- Helper Components ---------- */

function Section({
  icon,
  label,
  title,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground border border-border px-2 py-0.5">{label}</span>
        <div className="text-muted-foreground">{icon}</div>
        <h2 className="text-xl font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function CodeBlock({ children }: { children: React.ReactNode }) {
  return (
    <pre className="bg-black/80 text-green-400 text-xs p-4 overflow-x-auto leading-relaxed border border-border whitespace-pre-wrap">
      {children}
    </pre>
  );
}

function RuleTable() {
  const [expanded, setExpanded] = useState(false);

  const rules = [
    { id: 'R1', condition: 'FDS is HIGH AND Temp is OPTIMAL', output: 'HIGH Fertility', center: 90, note: 'Best case' },
    { id: 'R2', condition: 'FDS is HIGH AND Temp is COLD', output: 'MEDIUM-HIGH', center: 70, note: 'Good insulation protects' },
    { id: 'R3', condition: 'FDS is HIGH AND Temp is HOT', output: 'MEDIUM', center: 55, note: 'Dense feathers retain heat' },
    { id: 'R4', condition: 'FDS is MEDIUM AND Temp is OPTIMAL', output: 'MEDIUM', center: 65, note: '' },
    { id: 'R5', condition: 'FDS is MEDIUM AND Temp is COLD', output: 'LOW-MEDIUM', center: 50, note: '' },
    { id: 'R6', condition: 'FDS is MEDIUM AND Temp is HOT', output: 'LOW-MEDIUM', center: 45, note: '' },
    { id: 'R7', condition: 'FDS is LOW AND Temp is COLD', output: 'LOW', center: 25, note: 'Poor insulation + cold = high stress' },
    { id: 'R8', condition: 'FDS is LOW AND Temp is OPTIMAL', output: 'MEDIUM-LOW', center: 40, note: '' },
    { id: 'R9', condition: 'FDS is LOW AND Temp is HOT', output: 'LOW', center: 20, note: 'Worst case' },
    { id: 'R10', condition: 'FDS is HIGH AND Temp is OPTIMAL AND Humidity is OPTIMAL', output: 'HIGH', center: 95, note: 'Perfect conditions' },
    { id: 'R11', condition: 'FDS is HIGH AND Humidity is LOW', output: 'MEDIUM-LOW', center: 35, note: 'Humidity penalty' },
    { id: 'R12', condition: 'FDS is HIGH AND Humidity is HIGH', output: 'MEDIUM-LOW', center: 30, note: 'Humidity penalty' },
    { id: 'R13', condition: 'TCI ≥ 0.80 (Heat Stress)', output: 'LOW', center: 20, note: 'TCI override rule' },
  ];

  const visible = expanded ? rules : rules.slice(0, 6);

  return (
    <div className="border border-border overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-secondary">
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-muted-foreground font-medium w-12">#</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">IF (Antecedent)</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">THEN (Output)</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-medium w-16">Center</th>
            <th className="text-left py-3 px-4 text-muted-foreground font-medium">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {visible.map((r) => (
            <tr key={r.id} className="hover:bg-secondary/50 transition-colors">
              <td className="py-3 px-4 text-muted-foreground">{r.id}</td>
              <td className="py-3 px-4 font-mono text-foreground">{r.condition}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-0.5 text-xs border ${
                  r.center >= 70 ? 'border-green-500/50 text-green-400' :
                  r.center >= 40 ? 'border-yellow-500/50 text-yellow-400' :
                  'border-red-500/50 text-red-400'
                }`}>{r.output}</span>
              </td>
              <td className="py-3 px-4 font-mono text-primary">{r.center}%</td>
              <td className="py-3 px-4 text-muted-foreground italic">{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-center gap-2 py-3 text-xs text-muted-foreground hover:text-foreground border-t border-border transition-colors bg-secondary hover:bg-secondary/80"
      >
        {expanded ? (
          <><ChevronUp className="h-3 w-3" /> Show less</>
        ) : (
          <><ChevronDown className="h-3 w-3" /> Show all {rules.length} rules</>
        )}
      </button>
    </div>
  );
}

function MembershipFunctionDiagram() {
  const width = 300;
  const height = 80;
  const pad = 20;

  // Temperature membership functions visualized
  // cold: trapezoid [0,0,18,22], optimal: triangle [18,21,24], hot: trapezoid [22,30,50,50]
  const scale = (v: number) => pad + (v / 50) * (width - pad * 2);
  const scaleY = (v: number) => height - pad - v * (height - pad * 2);

  const coldPoints = [
    [scale(0), scaleY(1)],
    [scale(18), scaleY(1)],
    [scale(22), scaleY(0)],
    [scale(50), scaleY(0)],
  ];

  const optPoints = [
    [scale(18), scaleY(0)],
    [scale(21), scaleY(1)],
    [scale(24), scaleY(0)],
  ];

  const hotPoints = [
    [scale(0), scaleY(0)],
    [scale(22), scaleY(0)],
    [scale(30), scaleY(1)],
    [scale(50), scaleY(1)],
  ];

  const toPath = (pts: number[][]) => pts.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <div className="mt-4 space-y-2">
      <p className="text-xs text-muted-foreground">Temperature membership functions (0–50°C range):</p>
      <svg width={width} height={height} className="w-full max-w-sm">
        <polyline points={toPath(coldPoints)} fill="none" stroke="#60a5fa" strokeWidth="1.5" />
        <polyline points={toPath(optPoints)} fill="none" stroke="#4ade80" strokeWidth="1.5" />
        <polyline points={toPath(hotPoints)} fill="none" stroke="#f87171" strokeWidth="1.5" />

        {/* Labels */}
        <text x={scale(9)} y={scaleY(1) - 4} fontSize="9" fill="#60a5fa">cold</text>
        <text x={scale(20)} y={scaleY(1) - 4} fontSize="9" fill="#4ade80">optimal</text>
        <text x={scale(34)} y={scaleY(1) - 4} fontSize="9" fill="#f87171">hot</text>

        {/* Axis */}
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#555" strokeWidth="0.5" />
        {[0, 18, 24, 50].map((v) => (
          <g key={v}>
            <line x1={scale(v)} y1={height - pad} x2={scale(v)} y2={height - pad + 4} stroke="#555" strokeWidth="0.5" />
            <text x={scale(v)} y={height - 4} fontSize="8" fill="#888" textAnchor="middle">{v}°C</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

function Step({ step, title, desc }: { step: string; title: string; desc: string }) {
  return (
    <div className="space-y-3">
      <div className="mx-auto h-12 w-12 border border-border flex items-center justify-center font-semibold">
        {step}
      </div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}