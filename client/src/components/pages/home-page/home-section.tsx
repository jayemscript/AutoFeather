'use client';

import React from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { ThemeButtons } from '@/components/customs/theme-buttons';
import Image from 'next/image';

export default function HomeSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background px-6 py-16">
      {/* ── Ambient background blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-150 w-150 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-20 h-125 w-125 rounded-full bg-primary/8 blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 h-75 w-75 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-[80px]" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-6xl space-y-12">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-foreground">
              Auto<span className="text-primary">Feather</span>
            </span>
          </div>
          <ThemeButtons />
        </div>

        {/* ── Hero ── */}
        <div className="grid gap-10 lg:grid-cols-[1fr_420px] lg:gap-16 items-center">
          {/* Left: Copy */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Fuzzy Logic Decision Support System
            </div>

            {/* Headline with logo thumbnail */}
            <div className="space-y-3">
              <div className="flex items-start gap-5">
                {/* Logo thumbnail — sits beside the headline block */}
                <div className="relative shrink-0 h-50 w-50 rounded-2xl border border-border  overflow-hidden mt-1">
                  <Image
                    src="/images/main_logo1.png"
                    alt="AutoFeather logo"
                    fill
                    className="object-contain p-2"
                    priority
                  />
                </div>

                {/* Headline text */}
                <h1 className="text-6xl font-black leading-[1.05] tracking-tight text-foreground lg:text-7xl">
                  Predict
                  <br />
                  <span className="text-primary">Fertility</span>
                  <br />
                  Precisely.
                </h1>
              </div>

              <p className="max-w-lg text-base leading-relaxed text-muted-foreground">
                AutoFeather evaluates feather density and thermal comfort
                through a fuzzy logic inference model — turning raw poultry
                sensor data into actionable fertility forecasts.
              </p>
            </div>

            {/* CTA row */}
            <div className="flex flex-wrap gap-3">
              <a
                href="/login"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 hover:shadow-[0_0_24px_hsl(var(--primary)/0.35)]"
              >
                Access System
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="/model"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-secondary/60 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition hover:bg-secondary"
              >
                Fuzzy Model
              </a>
            </div>

            {/* Secondary nav */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <a href="/about" className="transition hover:text-foreground">
                System Overview
              </a>
              <span className="select-none">·</span>
              <a
                href="/documentation"
                className="transition hover:text-foreground"
              >
                Documentation
              </a>
            </div>
          </div>

          {/* Right: Glass info card */}
          <div className="rounded-2xl border border-border bg-card/40 p-8 shadow-2xl backdrop-blur-xl space-y-6">
            {/* Card header */}
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">
                  Platform
                </p>
                <p className="font-semibold text-foreground text-sm">
                  AutoFeather Analytics
                </p>
              </div>
            </div>

            <div className="h-px bg-border" />

            {/* Feature pills */}
            <ul className="space-y-3">
              {[
                'Feather Density Evaluation',
                'Thermal Comfort Scoring',
                'Fertility Rate Prediction',
                'Fuzzy Inference Engine',
              ].map((label) => (
                <li
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-border bg-secondary/50 px-4 py-3 text-sm text-foreground"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="h-px bg-border" />

            <p className="text-xs text-muted-foreground leading-relaxed">
              Built on Mamdani fuzzy logic. Designed for poultry farm operators
              and veterinary data analysts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}