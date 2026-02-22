'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  ArrowLeft,
  Feather,
  Thermometer,
  Gauge,
  Activity,
  Bell,
  BarChart3,
  Brain,
  Cpu,
  Database,
  ImageIcon,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  ZoomIn,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Training result images (served from /public)
───────────────────────────────────────────── */
const RESULT_IMAGES = [
  {
    file: 'confusion_matrix_normalized.png',
    title: 'Normalized Confusion Matrix',
    desc: 'Shows the proportion of correctly and incorrectly classified samples per class, normalized to [0, 1]. Diagonal values represent per-class accuracy — values closer to 1.0 indicate a highly accurate classifier. Off-diagonal cells reveal misclassification patterns between Low and High feather density classes.',
  },
  {
    file: 'confusion_matrix.png',
    title: 'Confusion Matrix (Raw Counts)',
    desc: 'Displays the absolute number of predictions for each true vs. predicted class pair. This helps identify how many images were correctly classified versus confused with another class. Useful for understanding class imbalance impact on model decisions.',
  },
  {
    file: 'results.png',
    title: 'Training & Validation Results',
    desc: 'A comprehensive multi-metric plot across all 40 epochs. Tracks box loss, classification loss, precision, recall, and mAP50 / mAP50-95 for both training and validation sets. Converging curves signal healthy learning; diverging curves may indicate overfitting. The final mAP values summarize overall detection quality.',
  },
  {
    file: 'train_batch0.jpg',
    title: 'Training Batch 0 Sample',
    desc: 'A visual mosaic of the first training batch fed into the model. Displays annotated bounding boxes over chicken images labeled as Low or High feather density. Reviewing batch samples confirms that augmentation, label alignment, and image quality are correct before full training proceeds.',
  },
  {
    file: 'val_batch0_labels.jpg',
    title: 'Validation Batch 0 — Ground Truth Labels',
    desc: 'Shows ground-truth annotations from the first validation batch. These are the expected labels the model must predict. Comparing this image against the model\'s own predictions reveals spatial accuracy and whether bounding boxes are correctly localized around the feather regions.',
  },
];

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function DocumentationPageContent() {
  return (
    <section className="min-h-screen bg-background text-foreground px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-20">
        {/* Back */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </a>

        {/* ── Header ─────────────────────────────── */}
        <header className="space-y-6">
          <span className="inline-flex items-center gap-2 border border-border bg-secondary px-4 py-1 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            Documentation
          </span>

          <h1 className="text-5xl font-bold tracking-tight">
            System Documentation
            <span className="block text-2xl text-muted-foreground mt-2">
              AutoFeather – Fuzzy Logic Fertility Prediction System for Chicken
            </span>
          </h1>

          <p className="max-w-3xl text-muted-foreground leading-relaxed">
            This section documents the core functionality, system components,
            and operational flow of AutoFeather. The platform evaluates poultry
            fertility conditions by processing feather density and thermal
            comfort data using fuzzy logic inference — powered by a YOLOv8
            image classification model trained specifically for chicken feather
            density detection.
          </p>
        </header>

        {/* ── Core Functions ───────────────────────── */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">Core System Functions</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <DocCard
              icon={<Feather />}
              title="Feather Density Evaluation"
              desc="Analyzes feather coverage as a physiological indicator influencing thermal regulation and fertility performance."
              items={[
                'YOLO-powered image-based feather density detection',
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

        {/* ── YOLO AI Training ─────────────────────── */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <Cpu className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">
              YOLO AI Image Classification Training
            </h2>
          </div>

          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            AutoFeather uses a{' '}
            <span className="text-foreground font-medium">
              YOLOv8 image classification model
            </span>{' '}
            to detect and categorize chicken feather density directly from
            images. The model distinguishes between{' '}
            <span className="text-foreground font-medium">Low</span> and{' '}
            <span className="text-foreground font-medium">High</span> feather
            density classes, which are then fed into the fuzzy logic engine as
            primary input variables.
          </p>

          {/* Stats banner */}
          <div className="grid sm:grid-cols-3 gap-4">
            <StatBanner
              icon={<RefreshCw className="h-5 w-5" />}
              label="Training Epochs"
              value="40"
              sub="per training run"
            />
            <StatBanner
              icon={<Database className="h-5 w-5" />}
              label="Total Dataset Images"
              value="3,000+"
              sub="Low & High density combined"
            />
            <StatBanner
              icon={<ImageIcon className="h-5 w-5" />}
              label="Training Runs"
              value="8×"
              sub="due to dataset challenges"
            />
          </div>

          {/* Training detail cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <DocCard
              icon={<Database />}
              title="Dataset Composition"
              desc="Over 3,000 labeled images were curated to represent both feather density classes for balanced training."
              items={[
                '3,000+ total images collected',
                'Two classes: Low Feather Density & High Feather Density',
                'Images sourced from real chicken farm environments',
                'Balanced split to avoid class bias',
              ]}
            />

            <DocCard
              icon={<RefreshCw />}
              title="Training Configuration"
              desc="The YOLO model was trained with a fixed epoch count and required multiple retraining iterations to overcome dataset issues."
              items={[
                '40 epochs per training run',
                '8 total training runs performed',
                'Retraining caused by dataset quality and labeling issues',
                'Final model selected from the best-performing run',
              ]}
            />

            <DocCard
              icon={<ImageIcon />}
              title="Dataset Challenges"
              desc="Building a reliable chicken feather density dataset posed several practical difficulties in the field."
              items={[
                'Inconsistent image lighting across farm environments',
                'Variability in chicken posture and distance from camera',
                'Early datasets had labeling inconsistencies requiring correction',
                'Multiple re-annotation and re-collection rounds conducted',
              ]}
            />

            <DocCard
              icon={<Cpu />}
              title="Model Architecture"
              desc="YOLOv8 was selected for its speed and accuracy balance, making it suitable for real-time or near-real-time poultry assessment."
              items={[
                'YOLOv8 classification backbone',
                'Optimized for binary feather density classification',
                'Lightweight enough for edge or server deployment',
                'Output class confidence passed to fuzzy logic engine',
              ]}
            />
          </div>
        </section>

        {/* ── Data & Alerts ───────────────────────── */}
        <section className="space-y-8">
          <h2 className="text-2xl font-semibold">
            Data Handling &amp; Notifications
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

        {/* ── Training Results Gallery ─────────────── */}
        <section className="space-y-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-semibold">
              Model Training Results &amp; Visual Analysis
            </h2>
          </div>

          <p className="text-muted-foreground leading-relaxed max-w-3xl">
            The following outputs were generated after the final 40-epoch
            training run. Each image provides a distinct perspective on model
            performance — from raw classification counts to per-batch sample
            visualization. Expand each card to read a detailed interpretation.
          </p>

          <div className="space-y-6">
            {RESULT_IMAGES.map((img) => (
              <ResultImageCard key={img.file} img={img} />
            ))}
          </div>
        </section>

        {/* ── Workflow ─────────────────────────────── */}
        <section className="border border-border bg-card p-10 space-y-8">
          <h2 className="text-2xl font-semibold text-center">
            System Workflow
          </h2>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <Step
              step="1"
              title="Image Capture"
              desc="Camera captures a photo of the chicken. The YOLO model classifies feather density as Low or High."
            />
            <Step
              step="2"
              title="Data Acquisition"
              desc="Sensors collect environmental temperature data alongside the YOLO classification output."
            />
            <Step
              step="3"
              title="Fuzzy Evaluation"
              desc="Input values are fuzzified and processed using predefined inference rules."
            />
            <Step
              step="4"
              title="Decision Output"
              desc="The system generates a fertility prediction and optional alerts for user action."
            />
          </div>
        </section>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   Result Image Card (expandable)
───────────────────────────────────────────── */
function ResultImageCard({
  img,
}: {
  img: { file: string; title: string; desc: string };
}) {
  const [open, setOpen] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const src = `/images/results/${img.file}`;

  return (
    <>
      <div className="border border-border bg-secondary overflow-hidden">
        {/* Header row */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent/40 transition text-left"
        >
          <span className="font-semibold">{img.title}</span>
          {open ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Expandable body */}
        {open && (
          <div className="px-6 pb-6 space-y-4">
            {/* Image */}
            <div className="relative group cursor-pointer" onClick={() => setLightbox(true)}>
              <Image
                src={src}
                alt={img.title}
                width={900}
                height={500}
                className="w-full object-contain border border-border bg-muted"
                unoptimized
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition">
                <ZoomIn className="h-8 w-8 text-white" />
              </div>
            </div>

            {/* Description */}
            <div className="border-l-2 border-primary pl-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="block text-xs uppercase tracking-widest text-primary mb-1 font-semibold">
                  Interpretation
                </span>
                {img.desc}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <Image
            src={src}
            alt={img.title}
            width={1200}
            height={800}
            className="max-w-full max-h-[90vh] object-contain"
            unoptimized
          />
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────
   Stat Banner
───────────────────────────────────────────── */
function StatBanner({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="border border-border bg-card p-6 flex flex-col gap-2">
      <div className="text-primary">{icon}</div>
      <p className="text-xs text-muted-foreground uppercase tracking-widest">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   DocCard
───────────────────────────────────────────── */
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
            <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 bg-primary" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Step
───────────────────────────────────────────── */
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