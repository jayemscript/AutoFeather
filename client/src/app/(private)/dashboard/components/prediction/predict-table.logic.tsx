'use client';

import { useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { extractErrorMessage } from '@/configs/api.helper';
import PermissionWrapper from '@/components/customs/permission-wrapper';
import { showToastSuccess, showToastError } from '@/utils/toast-config';
import { PredictionInfo } from '@/api/protected/predict/predict-api.interface';
import { GetAllPredictionPaginated } from '@/api/protected/predict/predict-api';
import { MoreHorizontal } from 'lucide-react';

export function usePredictionTableLogic() {
  const [refreshFn, setRefreshFn] = useState<(() => void) | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
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

  //   const handleEditRecord = (lib: ChickenBreedInfo) => {
  //     window.location.hash = 'edit-chicken-breed-record';
  //     setSelectedRecord(lib);
  //     setModalMode('edit');
  //     setModalOpen(true);
  //   };

  const checkboxActions = [];

  const columns: ColumnDef<PredictionInfo>[] = [
    {
      accessorKey: 'title',
      size: 200,
      header: 'Title',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'description',
      size: 200,
      header: 'Description',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'chickenBreed.chickenName',
      size: 200,
      header: 'Chicken Name',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
      id: 'actions',
      size: 60,
      header: '',
      cell: ({ row }) => {
        const rowData = row.original;
        // Determine action states\
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              SOON
              <DropdownMenuSeparator />
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
    const cardData = row;

    return (
      <div className="group relative flex flex-col h-full rounded-xl border border-border bg-card shadow-sm hover:shadow-lg transition-all overflow-hidden">
        SOON
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

    // renderFormModal: () => (
    //   <ChickenBreedFormModal
    //     open={modalOpen}
    //     close={closeModal}
    //     onSuccess={handleModalSuccess}
    //     mode={modalMode}
    //     initialData={selectedRecord}
    //   />
    // ),
  };
}
