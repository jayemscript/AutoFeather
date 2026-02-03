'use client';

import React from 'react';
import { PredictionInfo } from '@/api/protected/predict/predict-api.interface';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PredictionPrintProps {
  prediction: PredictionInfo;
  onDownload?: () => void;
}

export function generatePredictionPDF(prediction: PredictionInfo) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 12;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('AutoFeather Prediction Report', pageWidth / 2, yPosition, {
    align: 'center',
  });

  yPosition += 5;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(
    `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
    pageWidth / 2,
    yPosition,
    { align: 'center' },
  );

  doc.setTextColor(0, 0, 0);
  yPosition += 7;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Record Information', 14, yPosition);
  yPosition += 4;

  autoTable(doc, {
    startY: yPosition,
    head: [['Field', 'Value']],
    body: [
      ['Title', prediction.title],
      ['Description', prediction.description || 'N/A'],
      ['Chicken Breed', prediction.chickenBreed?.chickenName || 'N/A'],
      ['Prepared By', prediction.preparedBy?.fullname || 'N/A'],
      ['Created', formatDate(prediction.createdAt)],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59],
      fontSize: 8,
      fontStyle: 'bold',
      cellPadding: 1.5,
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 'auto' },
    },
  });

  yPosition = (doc as any).lastAutoTable.finalY + 5;

  const col1X = 14;
  const col2X = 110;
  const startY = yPosition;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Findings', col1X, yPosition);
  yPosition += 4;

  autoTable(doc, {
    startY: yPosition,
    margin: { left: col1X },
    body: [
      ['Feather Density', prediction.classification?.featherDensity || 'N/A'],
      [
        'Confidence',
        prediction.classification?.confidence
          ? `${(prediction.classification.confidence * 100).toFixed(1)}%`
          : 'N/A',
      ],
      ['Fertility Level', prediction.fuzzyResult?.fertilityLevel || 'N/A'],
      [
        'Fertility Score',
        prediction.fuzzyResult?.fertilityScore
          ? `${prediction.fuzzyResult.fertilityScore.toFixed(1)}%`
          : 'N/A',
      ],
    ],
    theme: 'striped',
    styles: {
      fontSize: 7,
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { cellWidth: 35, fontStyle: 'bold' },
      1: { cellWidth: 38, fontStyle: 'bold' },
    },
    tableWidth: 75,
  });

  const col1FinalY = (doc as any).lastAutoTable.finalY;

  yPosition = startY;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Environment', col2X, yPosition);
  yPosition += 4;

  autoTable(doc, {
    startY: yPosition,
    margin: { left: col2X },
    head: [['Parameter', 'Value', 'Optimal']],
    body: [
      ['Temperature', `${prediction.temperature}°C`, '18-24°C'],
      [
        'Humidity',
        prediction.humidity ? `${prediction.humidity}%` : 'N/A',
        '50-70%',
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [249, 115, 22],
      fontSize: 7,
      fontStyle: 'bold',
      cellPadding: 1.5,
    },
    bodyStyles: {
      fontSize: 7,
      cellPadding: 1.5,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 18 },
      2: { cellWidth: 20 },
    },
    tableWidth: 65,
  });

  yPosition = Math.max(col1FinalY, (doc as any).lastAutoTable.finalY) + 5;

  if (prediction.classification) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('AI Classification (YOLOv8)', 14, yPosition);
    yPosition += 4;

    const classificationData = [
      ['Feather Density', prediction.classification.featherDensity],
      [
        'Confidence',
        `${(prediction.classification.confidence * 100).toFixed(2)}%`,
      ],
      ['Model', prediction.classification.modelVersion || 'N/A'],
      [
        'Inference',
        prediction.classification.inferenceTimeMs
          ? `${prediction.classification.inferenceTimeMs.toFixed(2)} ms`
          : 'N/A',
      ],
    ];

    if (prediction.classification.raw?.top5_predictions) {
      prediction.classification.raw.top5_predictions.forEach((pred, idx) => {
        classificationData.push([
          idx === 0 ? 'Predictions:' : '',
          `${pred.class}: ${(pred.confidence * 100).toFixed(1)}%`,
        ]);
      });
    }

    autoTable(doc, {
      startY: yPosition,
      body: classificationData,
      theme: 'striped',
      styles: {
        fontSize: 7,
        cellPadding: 1.5,
      },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 'auto' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 5;
  }

  if (prediction.fuzzyResult) {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Fuzzy Logic Fertility Analysis', 14, yPosition);
    yPosition += 4;

    const fuzzyData = [
      ['Fertility Level', prediction.fuzzyResult.fertilityLevel],
      [
        'Fertility Score',
        `${prediction.fuzzyResult.fertilityScore.toFixed(2)}%`,
      ],
    ];

    if (prediction.fuzzyResult.inputs) {
      fuzzyData.push(
        ['Input - FD', prediction.fuzzyResult.inputs.featherDensity],
        ['Input - Temp', `${prediction.fuzzyResult.inputs.temperature}°C`],
        [
          'Input - Humid',
          prediction.fuzzyResult.inputs.humidity
            ? `${prediction.fuzzyResult.inputs.humidity}%`
            : 'N/A',
        ],
      );
    }

    autoTable(doc, {
      startY: yPosition,
      body: fuzzyData,
      theme: 'grid',
      headStyles: {
        fillColor: [139, 92, 246],
        fontSize: 7,
        fontStyle: 'bold',
        cellPadding: 1.5,
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 1.5,
      },
      columnStyles: {
        0: { cellWidth: 35, fontStyle: 'bold' },
        1: { cellWidth: 'auto', fontStyle: 'bold' },
      },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 4;

    if (prediction.fuzzyResult.explanation && yPosition < 250) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Analysis:', 14, yPosition);
      yPosition += 3;

      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(
        prediction.fuzzyResult.explanation,
        pageWidth - 28,
      );
      const maxLines = Math.min(splitText.length, 8);
      doc.text(splitText.slice(0, maxLines), 14, yPosition);
      yPosition += maxLines * 2.5 + 3;
    }

    if (
      prediction.fuzzyResult.ruleStrengths &&
      Object.keys(prediction.fuzzyResult.ruleStrengths).length > 0 &&
      yPosition < 265
    ) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Top Active Rules', 14, yPosition);
      yPosition += 3;

      const ruleData = Object.entries(prediction.fuzzyResult.ruleStrengths)
        .sort(([, a], [, b]) =>
          typeof a === 'number' && typeof b === 'number' ? b - a : 0,
        )
        .slice(0, 5)
        .map(([rule, strength]) => [
          rule.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          typeof strength === 'number' ? strength.toFixed(4) : strength,
        ]);

      autoTable(doc, {
        startY: yPosition,
        head: [['Rule', 'Strength']],
        body: ruleData,
        theme: 'striped',
        headStyles: {
          fillColor: [139, 92, 246],
          fontSize: 6.5,
          fontStyle: 'bold',
          cellPadding: 1,
        },
        bodyStyles: {
          fontSize: 6.5,
          cellPadding: 1,
        },
        columnStyles: {
          0: { cellWidth: 140 },
          1: { halign: 'right', fontStyle: 'bold' },
        },
      });
    }
  }

  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    doc.text(
      `AutoFeather Report - Page ${i} of ${totalPages}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' },
    );
  }

  doc.save(`AutoFeather_Report_${prediction.title}_${Date.now()}.pdf`);
}

export default function PredictionPrint({
  prediction,
  onDownload,
}: PredictionPrintProps) {
  return null;
}
