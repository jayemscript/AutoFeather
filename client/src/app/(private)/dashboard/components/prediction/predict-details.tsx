'use client';

import React, { useRef } from 'react';
import { PredictionInfo } from '@/api/protected/predict/predict-api.interface';
import Modal from '@/components/customs/modal/modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { generatePredictionPDF } from './prediction-print';
import {
  FaPrint,
  FaThermometerHalf,
  FaTint,
  FaFeatherAlt,
  FaBrain,
  FaChartLine,
  FaCalendar,
  FaUser,
  FaClock,
  FaImage,
} from 'react-icons/fa';

interface PredictionDetailsProps {
  open: boolean;
  onClose: () => void;
  prediction: PredictionInfo | null;
}

export default function PredictionDetails({
  open,
  onClose,
  prediction,
}: PredictionDetailsProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  if (!prediction) return null;

  const getFertilityBadgeClass = (level: string) => {
    switch (level) {
      case 'HIGH':   return 'bg-green-600 text-white border-0 shadow-sm';
      case 'MEDIUM': return 'bg-yellow-500 text-white border-0 shadow-sm';
      case 'LOW':    return 'bg-destructive text-white border-0 shadow-sm';
      default:       return 'bg-muted text-muted-foreground border-0';
    }
  };

  const getFertilityBarColor = (level: string) => {
    switch (level) {
      case 'HIGH':   return 'bg-green-600';
      case 'MEDIUM': return 'bg-yellow-500';
      case 'LOW':    return 'bg-destructive';
      default:       return 'bg-muted';
    }
  };

  const getFertilityStrokeColor = (level: string) => {
    switch (level) {
      case 'HIGH':   return '#16a34a';
      case 'MEDIUM': return '#eab308';
      case 'LOW':    return '#ef4444';
      default:       return '#888';
    }
  };

  const getFeatherBadgeClass = (density: string) => {
    return density === 'HIGH'
      ? 'bg-primary text-primary-foreground border-0 shadow-sm'
      : 'bg-secondary text-secondary-foreground border-0 shadow-sm';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    generatePredictionPDF(prediction);
  };

  return (
    <Modal
      open={open}
      close={onClose}
      width="!max-w-[85vw]"
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg shadow-sm">
            <FaChartLine className="text-primary-foreground text-lg" />
          </div>
          <div>
            <span className="text-xl font-bold text-foreground">
              Prediction Report
            </span>
            <p className="text-xs text-muted-foreground font-normal mt-0.5">
              AI-Powered Fertility Analysis
            </p>
          </div>
        </div>
      }
      footerChildren={
        <div className="flex gap-3 w-full justify-end">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="gap-2"
          >
            <FaPrint className="text-muted-foreground" /> Download PDF
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div ref={reportRef} className="space-y-6 pb-4">

        {/* ── Top 3 Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Feather Density */}
          <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="p-1.5 bg-secondary rounded-md">
                  <FaFeatherAlt className="text-secondary-foreground text-xs" />
                </div>
                Feather Density
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold text-foreground">
                    {prediction.classification?.featherDensity || 'N/A'}
                  </span>
                  {prediction.classification?.featherDensity && (
                    <div className="mt-2">
                      <Badge className={getFeatherBadgeClass(prediction.classification.featherDensity)}>
                        {(prediction.classification.confidence * 100).toFixed(1)}% confidence
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                  <FaFeatherAlt className="text-xl text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fertility Level */}
          <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="p-1.5 bg-secondary rounded-md">
                  <FaBrain className="text-secondary-foreground text-xs" />
                </div>
                Fertility Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold text-foreground">
                    {prediction.fuzzyResult?.fertilityLevel || 'N/A'}
                  </span>
                  {prediction.fuzzyResult?.fertilityScore != null && (
                    <div className="mt-2">
                      <Badge className={getFertilityBadgeClass(prediction.fuzzyResult.fertilityLevel)}>
                        {prediction.fuzzyResult.fertilityScore.toFixed(1)}% score
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                  <FaBrain className="text-xl text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Environment */}
          <Card className="border border-border shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                <div className="p-1.5 bg-secondary rounded-md">
                  <FaThermometerHalf className="text-secondary-foreground text-xs" />
                </div>
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold text-foreground">
                    {prediction.temperature}°C
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    <FaTint className="text-primary text-sm" />
                    <span className="text-sm font-semibold text-muted-foreground">
                      {prediction.humidity ? `${prediction.humidity}%` : 'No humidity data'}
                    </span>
                  </div>
                </div>
                <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                  <FaThermometerHalf className="text-xl text-secondary-foreground" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Analyzed Image ── */}
        {prediction.image && (
          <Card className="border border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary border-b border-border">
              <CardTitle className="flex items-center gap-3 text-foreground text-sm">
                <div className="p-1.5 bg-background rounded-md border border-border">
                  <FaImage className="text-muted-foreground text-xs" />
                </div>
                Analyzed Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full h-80 bg-muted">
                <img
                  src={prediction.image}
                  alt={prediction.title}
                  className="w-full h-full object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Record Information ── */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="bg-secondary border-b border-border">
            <CardTitle className="flex items-center gap-3 text-foreground text-sm">
              <div className="p-1.5 bg-background rounded-md border border-border">
                <FaUser className="text-muted-foreground text-xs" />
              </div>
              Record Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Title
                </label>
                <p className="text-base font-semibold text-foreground">
                  {prediction.title}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Chicken Breed
                </label>
                <p className="text-base font-semibold text-foreground">
                  {prediction.chickenBreed?.chickenName || 'N/A'}
                </p>
              </div>
            </div>

            {prediction.description && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  Description
                </label>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {prediction.description}
                </p>
              </div>
            )}

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FaUser className="text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground block">Prepared by</span>
                  <span className="font-semibold text-foreground text-sm">
                    {prediction.preparedBy?.fullname}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                <FaCalendar className="text-muted-foreground" />
                <div>
                  <span className="text-xs text-muted-foreground block">Created</span>
                  <span className="font-semibold text-foreground text-sm">
                    {formatDate(prediction.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Environmental Parameters ── */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="bg-secondary border-b border-border">
            <CardTitle className="flex items-center gap-3 text-foreground text-sm">
              <div className="p-1.5 bg-background rounded-md border border-border">
                <FaThermometerHalf className="text-muted-foreground text-xs" />
              </div>
              Environmental Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Temperature bar */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Temperature
                  </span>
                  <span className="text-2xl font-bold text-foreground font-mono">
                    {prediction.temperature}°C
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((prediction.temperature / 40) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0°C</span>
                  <span className="text-primary font-semibold">Optimal: 18–24°C</span>
                  <span>40°C</span>
                </div>
              </div>

              {/* Humidity bar */}
              {prediction.humidity ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Humidity
                    </span>
                    <span className="text-2xl font-bold text-foreground font-mono">
                      {prediction.humidity}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-primary h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${prediction.humidity}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0%</span>
                    <span className="text-primary font-semibold">Optimal: 50–70%</span>
                    <span>100%</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full p-6 bg-muted rounded-lg border border-dashed border-border">
                  <div className="text-center space-y-1">
                    <FaTint className="text-muted-foreground text-2xl mx-auto opacity-40" />
                    <p className="text-xs text-muted-foreground">No humidity data provided</p>
                    <p className="text-xs text-muted-foreground opacity-60">
                      Adding humidity improves prediction accuracy
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── AI Classification Results ── */}
        {prediction.classification && (
          <Card className="border border-border shadow-sm">
            <CardHeader className="bg-secondary border-b border-border">
              <CardTitle className="flex items-center gap-3 text-foreground text-sm">
                <div className="p-1.5 bg-background rounded-md border border-border">
                  <FaFeatherAlt className="text-muted-foreground text-xs" />
                </div>
                AI Classification Results (YOLOv8)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Classification result */}
                <div className="p-5 bg-secondary rounded-xl border-l-4 border-primary">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-3">
                    Feather Density Classification
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-foreground">
                      {prediction.classification.featherDensity}
                    </span>
                    <Badge className={getFeatherBadgeClass(prediction.classification.featherDensity)}>
                      {(prediction.classification.confidence * 100).toFixed(2)}%
                    </Badge>
                  </div>
                </div>

                {/* Model performance */}
                <div className="p-5 bg-muted rounded-xl border-l-4 border-border">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest block mb-3">
                    Model Performance
                  </label>
                  <div className="space-y-3">
                    {prediction.classification.modelVersion && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Model Version</span>
                        <span className="font-semibold text-foreground font-mono text-xs bg-background border border-border px-2 py-1 rounded">
                          {prediction.classification.modelVersion}
                        </span>
                      </div>
                    )}
                    {prediction.classification.inferenceTimeMs && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Inference Time</span>
                        <span className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                          <FaClock className="text-muted-foreground text-xs" />
                          {prediction.classification.inferenceTimeMs.toFixed(2)}ms
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Top 5 predictions */}
              {prediction.classification.raw?.top5_predictions && (
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                    Top Predictions Distribution
                  </label>
                  <div className="space-y-3">
                    {prediction.classification.raw.top5_predictions.map((pred, idx) => (
                      <div key={idx}>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm font-semibold text-foreground">{pred.class}</span>
                          <span className="text-sm font-bold text-primary font-mono">
                            {(pred.confidence * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-2 rounded-full transition-all duration-500"
                            style={{ width: `${pred.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Fuzzy Logic Results ── */}
        {prediction.fuzzyResult && (
          <Card className="border border-border shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary border-b border-border">
              <CardTitle className="flex items-center gap-3 text-foreground text-sm">
                <div className="p-1.5 bg-background rounded-md border border-border">
                  <FaBrain className="text-muted-foreground text-xs" />
                </div>
                Fuzzy Logic Fertility Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">

              {/* Gauge */}
              <div className="p-8 bg-secondary rounded-xl border border-border">
                <div className="text-center space-y-4">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Overall Fertility Score
                  </p>
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-44 h-44 transform -rotate-90">
                      <circle
                        cx="88" cy="88" r="76"
                        stroke="var(--muted)"
                        strokeWidth="14"
                        fill="none"
                      />
                      <circle
                        cx="88" cy="88" r="76"
                        stroke={getFertilityStrokeColor(prediction.fuzzyResult.fertilityLevel)}
                        strokeWidth="14"
                        fill="none"
                        strokeDasharray={`${(prediction.fuzzyResult.fertilityScore / 100) * 477} 477`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-bold text-foreground font-mono">
                        {prediction.fuzzyResult.fertilityScore.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground font-semibold mt-1">
                        out of 100
                      </span>
                    </div>
                  </div>
                  <Badge className={`${getFertilityBadgeClass(prediction.fuzzyResult.fertilityLevel)} text-sm px-6 py-2`}>
                    {prediction.fuzzyResult.fertilityLevel} FERTILITY
                  </Badge>
                </div>
              </div>

              {/* Inputs summary */}
              {prediction.fuzzyResult.inputs && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-secondary rounded-xl border-l-4 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <FaFeatherAlt className="text-primary text-xs" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Feather Density
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {prediction.fuzzyResult.inputs.featherDensity}
                    </p>
                  </div>
                  <div className="p-4 bg-secondary rounded-xl border-l-4 border-primary">
                    <div className="flex items-center gap-2 mb-2">
                      <FaThermometerHalf className="text-primary text-xs" />
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        Temperature
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-foreground font-mono">
                      {prediction.fuzzyResult.inputs.temperature}°C
                    </p>
                  </div>
                  {prediction.fuzzyResult.inputs.humidity ? (
                    <div className="p-4 bg-secondary rounded-xl border-l-4 border-primary">
                      <div className="flex items-center gap-2 mb-2">
                        <FaTint className="text-primary text-xs" />
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                          Humidity
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-foreground font-mono">
                        {prediction.fuzzyResult.inputs.humidity}%
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center gap-1">
                      <FaTint className="text-muted-foreground opacity-30 text-xl" />
                      <p className="text-xs text-muted-foreground">No humidity</p>
                    </div>
                  )}
                </div>
              )}

              {/* Explanation */}
              {prediction.fuzzyResult.explanation && (
                <div className="p-5 bg-muted rounded-xl border-l-4 border-primary">
                  <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-secondary rounded-md border border-border mt-0.5">
                      <FaBrain className="text-muted-foreground text-xs" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-widest">
                        Analysis Explanation
                      </p>
                      <p className="text-sm text-foreground leading-relaxed">
                        {prediction.fuzzyResult.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Active fuzzy rules */}
              {prediction.fuzzyResult.ruleStrengths &&
                Object.keys(prediction.fuzzyResult.ruleStrengths).length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Active Fuzzy Rules
                    </p>
                    <Badge variant="outline" className="font-mono text-xs">
                      {Object.keys(prediction.fuzzyResult.ruleStrengths).length} rules
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-4 bg-muted rounded-xl border border-border">
                    {Object.entries(prediction.fuzzyResult.ruleStrengths).map(([rule, strength]) => (
                      <div
                        key={rule}
                        className="p-4 bg-background rounded-lg border border-border hover:border-primary hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs font-semibold text-foreground flex-1 pr-2">
                            {rule.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                          </p>
                          <span className="text-xs font-bold text-primary font-mono">
                            {typeof strength === 'number' ? strength.toFixed(3) : strength}
                          </span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`${getFertilityBarColor(prediction.fuzzyResult.fertilityLevel)} h-1.5 rounded-full transition-all duration-500`}
                            style={{
                              width: `${(typeof strength === 'number' ? strength : 0) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </Modal>
  );
}