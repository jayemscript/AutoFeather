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

  const getFertilityColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200';
      case 'MEDIUM':
        return 'bg-amber-500 hover:bg-amber-600 shadow-amber-200';
      case 'LOW':
        return 'bg-rose-500 hover:bg-rose-600 shadow-rose-200';
      default:
        return 'bg-slate-500 hover:bg-slate-600 shadow-slate-200';
    }
  };

  const getFeatherDensityColor = (density: string) => {
    return density === 'HIGH'
      ? 'bg-sky-500 hover:bg-sky-600 shadow-sky-200'
      : 'bg-orange-500 hover:bg-orange-600 shadow-orange-200';
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
          <div className="p-2 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-lg shadow-lg">
            <FaChartLine className="text-white text-lg" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
              Prediction Report
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5">
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
            className="gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-300 dark:border-slate-600"
          >
            <FaPrint className="text-slate-600 dark:text-slate-400" /> Download
            PDF
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </Button>
        </div>
      }
    >
      <div ref={reportRef} className="space-y-6 pb-4">
        {/* Header Stats - Modern Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <div className="p-2 bg-sky-100 dark:bg-sky-900 rounded-lg">
                  <FaFeatherAlt className="text-sky-600 dark:text-sky-400 text-sm" />
                </div>
                Feather Density
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {prediction.classification?.featherDensity || 'N/A'}
                  </span>
                  {prediction.classification?.featherDensity && (
                    <div className="mt-2">
                      <Badge
                        className={`${getFeatherDensityColor(
                          prediction.classification.featherDensity,
                        )} shadow-md text-white border-0`}
                      >
                        {(prediction.classification.confidence * 100).toFixed(
                          1,
                        )}
                        % confidence
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 rounded-full bg-sky-200/30 dark:bg-sky-800/30 flex items-center justify-center">
                  <FaFeatherAlt className="text-2xl text-sky-600 dark:text-sky-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-900 rounded-lg">
                  <FaBrain className="text-emerald-600 dark:text-emerald-400 text-sm" />
                </div>
                Fertility Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {prediction.fuzzyResult?.fertilityLevel || 'N/A'}
                  </span>
                  {prediction.fuzzyResult?.fertilityScore && (
                    <div className="mt-2">
                      <Badge
                        className={`${getFertilityColor(
                          prediction.fuzzyResult.fertilityLevel,
                        )} shadow-md text-white border-0`}
                      >
                        {prediction.fuzzyResult.fertilityScore.toFixed(1)}%
                        score
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="w-16 h-16 rounded-full bg-emerald-200/30 dark:bg-emerald-800/30 flex items-center justify-center">
                  <FaBrain className="text-2xl text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <FaThermometerHalf className="text-orange-600 dark:text-orange-400 text-sm" />
                </div>
                Environment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">
                    {prediction.temperature}°C
                  </span>
                  <div className="mt-2 flex items-center gap-2">
                    <FaTint className="text-cyan-500 dark:text-cyan-400 text-sm" />
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                      {prediction.humidity ? `${prediction.humidity}%` : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="w-16 h-16 rounded-full bg-orange-200/30 dark:bg-orange-800/30 flex items-center justify-center">
                  <FaThermometerHalf className="text-2xl text-orange-600 dark:text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Image Display - Modern Style */}
        {prediction.image && (
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-violet-50 to-fuchsia-50 dark:from-violet-950 dark:to-fuchsia-950 border-b dark:border-slate-700">
              <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-lg">
                  <FaImage className="text-violet-600 dark:text-violet-400" />
                </div>
                Analyzed Image
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="relative w-full h-80 bg-slate-100 dark:bg-slate-800">
                <img
                  src={prediction.image}
                  alt={prediction.title}
                  className="w-full h-full object-contain"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Basic Information - Enhanced */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b dark:border-slate-700">
            <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
              <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg">
                <FaUser className="text-slate-700 dark:text-slate-300" />
              </div>
              Record Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Title
                </label>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {prediction.title}
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Chicken Breed
                </label>
                <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  {prediction.chickenBreed?.chickenName || 'N/A'}
                </p>
              </div>
            </div>

            {prediction.description && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Description
                </label>
                <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                  {prediction.description}
                </p>
              </div>
            )}

            <Separator className="my-4" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <FaUser className="text-slate-400 dark:text-slate-500 text-lg" />
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Prepared by
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {prediction.preparedBy?.fullname}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <FaCalendar className="text-slate-400 dark:text-slate-500 text-lg" />
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">
                    Created
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {formatDate(prediction.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Parameters - Chart Style */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 border-b dark:border-slate-700">
            <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <FaThermometerHalf className="text-orange-600 dark:text-orange-400" />
              </div>
              Environmental Parameters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    Temperature
                  </span>
                  <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {prediction.temperature}°C
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-orange-600 dark:from-orange-500 dark:to-orange-700 h-3 rounded-full transition-all duration-500 shadow-lg"
                      style={{
                        width: `${Math.min((prediction.temperature / 40) * 100, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>0°C</span>
                    <span className="font-semibold text-orange-600 dark:text-orange-400">
                      Optimal: 18-24°C
                    </span>
                    <span>40°C</span>
                  </div>
                </div>
              </div>

              {prediction.humidity && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      Humidity
                    </span>
                    <span className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">
                      {prediction.humidity}%
                    </span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-cyan-400 to-cyan-600 dark:from-cyan-500 dark:to-cyan-700 h-3 rounded-full transition-all duration-500 shadow-lg"
                        style={{ width: `${prediction.humidity}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>0%</span>
                      <span className="font-semibold text-cyan-600 dark:text-cyan-400">
                        Optimal: 50-70%
                      </span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* AI Classification Results - Modern Charts */}
        {prediction.classification && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 border-b dark:border-slate-700">
              <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                <div className="p-2 bg-sky-100 dark:bg-sky-900 rounded-lg">
                  <FaFeatherAlt className="text-sky-600 dark:text-sky-400" />
                </div>
                AI Classification Results (YOLOv8)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 rounded-xl border-l-4 border-sky-500 dark:border-sky-400">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-3">
                    Feather Density Classification
                  </label>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-sky-700 dark:text-sky-400">
                      {prediction.classification.featherDensity}
                    </span>
                    <Badge
                      className={`${getFeatherDensityColor(
                        prediction.classification.featherDensity,
                      )} shadow-md text-white border-0 px-3 py-1`}
                    >
                      {(prediction.classification.confidence * 100).toFixed(2)}%
                    </Badge>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-xl border-l-4 border-slate-400 dark:border-slate-500">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide block mb-3">
                    Model Performance
                  </label>
                  <div className="space-y-3">
                    {prediction.classification.modelVersion && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          Model Version
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 font-mono text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                          {prediction.classification.modelVersion}
                        </span>
                      </div>
                    )}
                    {prediction.classification.inferenceTimeMs && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          Inference Time
                        </span>
                        <span className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <FaClock className="text-slate-500 dark:text-slate-400 text-xs" />
                          {prediction.classification.inferenceTimeMs.toFixed(2)}
                          ms
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {prediction.classification.raw?.top5_predictions && (
                <div>
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 block uppercase tracking-wide">
                    Top Predictions Distribution
                  </label>
                  <div className="space-y-3">
                    {prediction.classification.raw.top5_predictions.map(
                      (pred, idx) => (
                        <div key={idx} className="group">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                              {pred.class}
                            </span>
                            <span className="text-sm font-bold text-sky-600 dark:text-sky-400">
                              {(pred.confidence * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="relative">
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-sky-400 to-sky-600 dark:from-sky-500 dark:to-sky-700 h-2.5 rounded-full transition-all duration-500 group-hover:from-sky-500 group-hover:to-sky-700"
                                style={{ width: `${pred.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Fuzzy Logic Results - Premium Design */}
        {prediction.fuzzyResult && (
          <Card className="border-0 shadow-lg overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-violet-50 via-fuchsia-50 to-purple-50 dark:from-violet-950 dark:via-fuchsia-950 dark:to-purple-950 border-b dark:border-slate-700">
              <CardTitle className="flex items-center gap-3 text-slate-800 dark:text-slate-100">
                <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-lg">
                  <FaBrain className="text-violet-600 dark:text-violet-400" />
                </div>
                Fuzzy Logic Fertility Prediction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {/* Fertility Score Gauge - Enhanced */}
              <div className="p-8 bg-gradient-to-br from-violet-50 via-fuchsia-50 to-purple-50 dark:from-violet-950 dark:via-fuchsia-950 dark:to-purple-950 rounded-2xl border border-violet-100 dark:border-violet-900">
                <div className="text-center space-y-4">
                  <p className="text-sm font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    Overall Fertility Score
                  </p>
                  <div className="relative inline-flex items-center justify-center">
                    <svg className="w-44 h-44 transform -rotate-90">
                      <circle
                        cx="88"
                        cy="88"
                        r="76"
                        stroke="#e2e8f0"
                        strokeWidth="14"
                        fill="none"
                        className="dark:stroke-slate-700"
                      />
                      <circle
                        cx="88"
                        cy="88"
                        r="76"
                        stroke={
                          prediction.fuzzyResult.fertilityLevel === 'HIGH'
                            ? 'url(#gradient-high)'
                            : prediction.fuzzyResult.fertilityLevel === 'MEDIUM'
                              ? 'url(#gradient-medium)'
                              : 'url(#gradient-low)'
                        }
                        strokeWidth="14"
                        fill="none"
                        strokeDasharray={`${(prediction.fuzzyResult.fertilityScore / 100) * 477} 477`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient
                          id="gradient-high"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <linearGradient
                          id="gradient-medium"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="100%" stopColor="#d97706" />
                        </linearGradient>
                        <linearGradient
                          id="gradient-low"
                          x1="0%"
                          y1="0%"
                          x2="100%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#ef4444" />
                          <stop offset="100%" stopColor="#dc2626" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-5xl font-bold bg-gradient-to-br from-violet-600 to-fuchsia-600 dark:from-violet-400 dark:to-fuchsia-400 bg-clip-text text-transparent">
                        {prediction.fuzzyResult.fertilityScore.toFixed(1)}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                        out of 100
                      </span>
                    </div>
                  </div>
                  <Badge
                    className={`${getFertilityColor(prediction.fuzzyResult.fertilityLevel)} text-base px-6 py-2 shadow-lg border-0`}
                  >
                    {prediction.fuzzyResult.fertilityLevel} FERTILITY
                  </Badge>
                </div>
              </div>

              {/* Inputs Summary - Card Grid */}
              {prediction.fuzzyResult.inputs && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950 dark:to-blue-950 rounded-xl border-l-4 border-sky-400 dark:border-sky-500">
                    <div className="flex items-center gap-2 mb-2">
                      <FaFeatherAlt className="text-sky-600 dark:text-sky-400" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        Feather Density
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-sky-700 dark:text-sky-400">
                      {prediction.fuzzyResult.inputs.featherDensity}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950 rounded-xl border-l-4 border-orange-400 dark:border-orange-500">
                    <div className="flex items-center gap-2 mb-2">
                      <FaThermometerHalf className="text-orange-600 dark:text-orange-400" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                        Temperature
                      </p>
                    </div>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                      {prediction.fuzzyResult.inputs.temperature}°C
                    </p>
                  </div>
                  {prediction.fuzzyResult.inputs.humidity && (
                    <div className="p-4 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950 dark:to-teal-950 rounded-xl border-l-4 border-cyan-400 dark:border-cyan-500">
                      <div className="flex items-center gap-2 mb-2">
                        <FaTint className="text-cyan-600 dark:text-cyan-400" />
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                          Humidity
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">
                        {prediction.fuzzyResult.inputs.humidity}%
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Explanation - Highlighted Box */}
              {prediction.fuzzyResult.explanation && (
                <div className="p-5 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950 dark:to-purple-950 rounded-xl border-l-4 border-violet-500 dark:border-violet-400">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-violet-100 dark:bg-violet-900 rounded-lg mt-0.5">
                      <FaBrain className="text-violet-600 dark:text-violet-400 text-sm" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">
                        Analysis Explanation
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {prediction.fuzzyResult.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Rule Strengths - Modern Chart */}
              {prediction.fuzzyResult.ruleStrengths &&
                Object.keys(prediction.fuzzyResult.ruleStrengths).length >
                  0 && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                        Active Fuzzy Rules
                      </p>
                      <Badge variant="outline" className="font-mono">
                        {
                          Object.keys(prediction.fuzzyResult.ruleStrengths)
                            .length
                        }{' '}
                        rules
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-80 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      {Object.entries(prediction.fuzzyResult.ruleStrengths).map(
                        ([rule, strength]) => (
                          <div
                            key={rule}
                            className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600 hover:shadow-md transition-all group"
                          >
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex-1 pr-2">
                                {rule
                                  .replace(/_/g, ' ')
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                              </p>
                              <span className="text-xs font-bold text-violet-600 dark:text-violet-400 font-mono">
                                {typeof strength === 'number'
                                  ? strength.toFixed(3)
                                  : strength}
                              </span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-violet-400 to-violet-600 dark:from-violet-500 dark:to-violet-700 h-2 rounded-full transition-all duration-500 group-hover:from-violet-500 group-hover:to-violet-700"
                                style={{
                                  width: `${(typeof strength === 'number' ? strength : 0) * 100}%`,
                                }}
                              />
                            </div>
                          </div>
                        ),
                      )}
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
