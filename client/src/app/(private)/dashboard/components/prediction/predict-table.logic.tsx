'use client';

import { useState, useCallback, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { extractErrorMessage } from '@/configs/api.helper';
import { showToastError } from '@/utils/toast-config';
import { PredictionInfo } from '@/api/protected/predict/predict-api.interface';
import {
  GetAllPredictionPaginated,
  deletePermanentlyPredictionRecord,
} from '@/api/protected/predict/predict-api';
import {
  FaEllipsisV,
  FaEye,
  FaThermometerHalf,
  FaTint,
  FaBrain,
  FaTrash,
} from 'react-icons/fa';
import PredictionFormModal from './predict-form';
import PredictionDetails from './predict-details';

export function usePredictionTableLogic() {
  const [refreshFn, setRefreshFn] = useState<(() => void) | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRecord, setSelectedRecord] = useState<PredictionInfo | null>(
    null,
  );

  const handleModalSuccess = () => {
    refreshFn?.();
  };

  const closeModal = () => {
    history.pushState(
      null,
      document.title,
      window.location.pathname + window.location.search,
    );
    setModalOpen(false);
  };

  const handleViewDetails = (record: PredictionInfo) => {
    setSelectedRecord(record);
    setDetailsOpen(true);
  };

  useEffect(() => {
    const checkHash = () => {
      if (
        window.location.hash === '#add-prediction-record' ||
        window.location.hash === '#edit-prediction-record'
      ) {
        setModalOpen(true);
      } else {
        setModalOpen(false);
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  const handleSetRefreshFn = useCallback((refresh: () => void) => {
    setRefreshFn(() => refresh);
  }, []);

  const handleDeleteRecord = async (id: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this record? This action cannot be undone.',
      )
    ) {
      return;
    }
    try {
      await deletePermanentlyPredictionRecord(id);
      showToastError(
        'Deleted',
        'Record has been deleted permanently',
        'bottom-right',
      );
      refreshFn?.();
    } catch (error) {
      showToastError(
        'Delete Failed',
        extractErrorMessage(error),
        'bottom-right',
      );
    }
  };

  const fetchData = async (params: {
    page: number;
    limit: number;
    keyword?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    filters?: Record<string, any>;
  }) => {
    try {
      const response = await GetAllPredictionPaginated(params);
      if (!response.prediction_records)
        throw new Error('Invalid response structure');

      return {
        data: response.prediction_records,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        currentPage: response.currentPage,
      };
    } catch (error) {
      showToastError(
        'Fetch Failed',
        extractErrorMessage(error),
        'bottom-right',
      );
      throw error;
    }
  };

  const handleNewAddRecord = () => {
    window.location.hash = 'add-prediction-record';
    setSelectedRecord(null);
    setModalMode('add');
    setModalOpen(true);
  };

  const checkboxActions = [];

  const getFertilityColor = (level: string) => {
    switch (level) {
      case 'HIGH':
        return 'bg-green-500';
      case 'MEDIUM':
        return 'bg-yellow-500';
      case 'LOW':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const columns: ColumnDef<PredictionInfo>[] = [
    {
      accessorKey: 'title',
      size: 200,
      header: 'Title',
      cell: ({ getValue, row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{getValue() as string}</span>
          {row.original.chickenBreed?.chickenName && (
            <span className="text-xs text-gray-500">
              {row.original.chickenBreed.chickenName}
            </span>
          )}
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      enableSorting: false,
      enableHiding: false,
      accessorKey: 'classification.featherDensity',
      header: 'Feather Density',
      cell: ({ row }) => {
        const density = row.original.classification?.featherDensity;
        const confidence = row.original.classification?.confidence;

        if (!density) return <span className="text-gray-400">N/A</span>;

        return (
          <div className="flex flex-col gap-1">
            <Badge variant={density === 'HIGH' ? 'default' : 'secondary'}>
              {density}
            </Badge>
            {confidence && (
              <span className="text-xs text-gray-500">
                {(confidence * 100).toFixed(1)}% confidence
              </span>
            )}
          </div>
        );
      },
    },
    {
      enableSorting: false,
      enableHiding: false,
      accessorKey: 'fuzzyResult.fertilityLevel',
      header: 'Fertility',
      cell: ({ row }) => {
        const level = row.original.fuzzyResult?.fertilityLevel;
        const score = row.original.fuzzyResult?.fertilityScore;

        if (!level) return <span className="text-gray-400">N/A</span>;

        return (
          <div className="flex flex-col gap-1">
            <Badge className={getFertilityColor(level)}>{level}</Badge>
            {score && (
              <span className="text-xs text-gray-500">{score.toFixed(1)}%</span>
            )}
          </div>
        );
      },
    },
    {
      enableSorting: false,
      enableHiding: false,
      accessorKey: 'temperature',
      header: 'Environment',
      cell: ({ row }) => (
        <div className="flex flex-col gap-1 text-sm">
          <div className="flex items-center gap-1">
            <FaThermometerHalf className="text-orange-500" />
            <span>{row.original.temperature}°C</span>
          </div>
          {row.original.humidity && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <FaTint className="text-blue-500" />
              <span>{row.original.humidity}%</span>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      size: 60,
      header: '',
      cell: ({ row }) => {
        const rowData = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <FaEllipsisV className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleViewDetails(rowData)}>
                <FaEye className="mr-2 h-4 w-4" />
                View Report
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleDeleteRecord(rowData.id)}>
                <FaTrash className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>

              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const cardComponent = ({ row }: { row: PredictionInfo }) => {
    const getFertilityGradient = (level: string) => {
      switch (level) {
        case 'HIGH':
          return 'from-green-500 to-emerald-600';
        case 'MEDIUM':
          return 'from-yellow-500 to-orange-500';
        case 'LOW':
          return 'from-red-500 to-rose-600';
        default:
          return 'from-gray-500 to-gray-600';
      }
    };

    return (
      <div className="group relative flex flex-col h-full rounded-xl border border-border bg-card shadow-sm hover:shadow-lg transition-all overflow-hidden">
        {/* Header with Image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200">
          {row.image ? (
            <img
              src={row.image}
              alt={row.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FaBrain className="text-gray-400 text-4xl" />
            </div>
          )}

          {/* Fertility Badge Overlay */}
          {row.fuzzyResult?.fertilityLevel && (
            <div className="absolute top-2 right-2">
              <Badge
                className={`bg-gradient-to-r ${getFertilityGradient(row.fuzzyResult.fertilityLevel)} text-white font-bold px-3 py-1`}
              >
                {row.fuzzyResult.fertilityLevel}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 flex-1">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{row.title}</h3>
            {row.chickenBreed?.chickenName && (
              <p className="text-sm text-gray-500">
                {row.chickenBreed.chickenName}
              </p>
            )}
          </div>

          {row.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {row.description}
            </p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <div className="bg-blue-50 p-2 rounded-lg">
              <p className="text-xs text-gray-600">Feather Density</p>
              <p className="font-semibold text-blue-700">
                {row.classification?.featherDensity || 'N/A'}
              </p>
            </div>
            <div className="bg-purple-50 p-2 rounded-lg">
              <p className="text-xs text-gray-600">Fertility Score</p>
              <p className="font-semibold text-purple-700">
                {row.fuzzyResult?.fertilityScore?.toFixed(1) || 'N/A'}%
              </p>
            </div>
          </div>

          {/* Environment */}
          <div className="flex gap-3 text-sm">
            <div className="flex items-center gap-1">
              <FaThermometerHalf className="text-orange-500" />
              <span>{row.temperature}°C</span>
            </div>
            {row.humidity && (
              <div className="flex items-center gap-1">
                <FaTint className="text-blue-500" />
                <span>{row.humidity}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          <Button
            onClick={() => handleViewDetails(row)}
            className="w-full"
            variant="outline"
          >
            <FaEye className="mr-2" />
            View Full Report
          </Button>
        </div>
      </div>
    );
  };

  return {
    columns,
    fetchData,
    handleSetRefreshFn,
    handleNewAddRecord,
    cardComponent,
    checkboxActions,

    renderFormModal: () => (
      <PredictionFormModal
        open={modalOpen}
        close={closeModal}
        onSuccess={handleModalSuccess}
        mode={modalMode}
        initialData={selectedRecord}
      />
    ),

    renderDetailsModal: () => (
      <PredictionDetails
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        prediction={selectedRecord}
      />
    ),
  };
}
