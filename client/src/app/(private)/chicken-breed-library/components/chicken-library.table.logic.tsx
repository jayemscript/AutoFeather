'use client';

import { useState, useCallback, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { formatDate } from '@syntaxsentinel/date-utils';
import { showToastSuccess, showToastError } from '@/utils/toast-config';
import { GetAllChickenBreedPaginated } from '@/api/protected/predict/chicken-breed.api';
import {
  ChickenBreedInfo,
  BreedPurposeEnum,
  GetAllPaginatedChickenBreed,
} from '@/api/protected/predict/chicken-breed-api.interface';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { extractErrorMessage } from '@/configs/api.helper';
import PermissionWrapper from '@/components/customs/permission-wrapper';

import { getAuditLogsByTransaction } from '@/api/protected/audit.api';
import { AuditLogs } from '@/api/protected/audit.api';
import DrawerComponent from '@/components/customs/drawer.component';
import AuditLogsViewer from '@/components/customs/audit-logs-viewer';
import { Button } from '@/components/ui/button';
import {
  Bird,
  Copy,
  Edit,
  Egg,
  Feather,
  Heart,
  MapPin,
  MoreHorizontal,
  Palette,
  Scale,
  Thermometer,
} from 'lucide-react';

export function useChickenBreedTableLogic() {
  const [refreshFn, setRefreshFn] = useState<(() => void) | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedRecord, setSelectedRecord] = useState<ChickenBreedInfo | null>(
    null,
  );

  const [auditLogsDrawerOpen, setAuditLogsDrawerOpen] = useState(false);
  const [auditLogsData, setAuditLogsData] = useState<AuditLogs[]>([]);
  const [isLoadingAuditLogs, setIsLoadingAuditLogs] = useState(false);

  const handleViewAuditLogs = async (lib: ChickenBreedInfo) => {
    try {
      setIsLoadingAuditLogs(true);
      setAuditLogsDrawerOpen(true);
      const response = await getAuditLogsByTransaction(
        `TX_CHICKEN_BREED-${lib.id}`,
      );
      if (response && response.data) {
        setAuditLogsData(response.data);
      } else if (Array.isArray(response)) {
        setAuditLogsData(response);
      } else {
        setAuditLogsData([]);
      }
    } catch (error: unknown) {
      showToastError(
        'Operation Failed',
        extractErrorMessage(error),
        'bottom-right',
      );
      setAuditLogsData([]);
    } finally {
      setIsLoadingAuditLogs(false);
    }
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedForDetails, setSelectedForDetails] =
    useState<ChickenBreedInfo | null>(null);

  const handleViewDetails = (lib: ChickenBreedInfo) => {
    setSelectedForDetails(lib);
    setDrawerOpen(true);
  };

  // Function to handle modal success (refresh data after add/edit)
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
        window.location.hash === '#add-chicken-breed-record' ||
        window.location.hash === '#edit-chicken-breed-record'
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
      const response = await GetAllChickenBreedPaginated(params);
      if (!response.chicken_breed_records)
        throw new Error('Invalid response structure');

      return {
        data: response.chicken_breed_records,
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
    window.location.hash = 'add-chicken-breed-record';
    setSelectedRecord(null);
    setModalMode('add');
    setModalOpen(true);
  };

  const handleEditRecord = (lib: ChickenBreedInfo) => {
    window.location.hash = 'edit-chicken-breed-record';
    setSelectedRecord(lib);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleCopy = (recordId: string) => {
    navigator.clipboard.writeText(recordId);
    showToastSuccess(
      'Copy Clipboard',
      'Chicken Code Copy Successfully',
      'top-center',
    );
  };

  const checkboxActions = [];

  const columns: ColumnDef<ChickenBreedInfo>[] = [
    {
      accessorKey: 'code',
      size: 200,
      header: 'Library Code',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'chickenName',
      size: 200,
      header: 'Chicken Name',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'scientificName',
      size: 200,
      header: 'Scientific Name',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'originCountry',
      size: 200,
      header: 'Country Origin',
      cell: ({ getValue }) => (
        <span className="text-sm">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: 'purpose',
      size: 200,
      header: 'Breed Purpose',
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

              <DropdownMenuItem onClick={() => handleCopy(rowData.code)}>
                Copy Library Code
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <PermissionWrapper permission="Update">
                <DropdownMenuItem onClick={() => handleEditRecord(rowData)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Record
                </DropdownMenuItem>
              </PermissionWrapper>

              <DropdownMenuSeparator />
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const cardComponent = ({ row }: { row: ChickenBreedInfo }) => {
    const cardData = row;

    const getPurposeColor = (purpose: BreedPurposeEnum) => {
      switch (purpose) {
        case BreedPurposeEnum.EGG:
          return 'bg-amber-100 text-amber-700 border-amber-200';
        case BreedPurposeEnum.MEAT:
          return 'bg-rose-100 text-rose-700 border-rose-200';
        case BreedPurposeEnum.DUAL:
          return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        default:
          return 'bg-gray-100 text-gray-700 border-gray-200';
      }
    };

    return (
      <div className="group relative flex flex-col h-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
          {cardData.image ? (
            <img
              src={cardData.image}
              alt={cardData.chickenName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Bird className="h-16 w-16 text-gray-400" />
            </div>
          )}

          {/* Purpose Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPurposeColor(cardData.purpose)}`}
            >
              {cardData.purpose.charAt(0).toUpperCase() +
                cardData.purpose.slice(1)}
            </span>
          </div>

          {/* Menu */}
          <div className="absolute top-3 right-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 bg-white/90 hover:bg-white backdrop-blur-sm"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>

                <DropdownMenuItem onClick={() => handleCopy(cardData.code)}>
                  <Copy className="mr-2 h-4 w-4" /> Copy Code
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                <PermissionWrapper permission="Update">
                  <DropdownMenuItem onClick={() => handleEditRecord(cardData)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Record
                  </DropdownMenuItem>
                </PermissionWrapper>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 flex flex-col p-4">
          {/* Header */}
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {cardData.chickenName}
            </h3>
            <p className="text-xs text-gray-500 italic mt-0.5">
              {cardData.scientificName}
            </p>
            <p className="text-xs text-gray-400 font-mono mt-1">
              {cardData.code}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-xs">
              <div className="p-1.5 rounded-lg bg-blue-50">
                <Egg className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-gray-500">Eggs/Year</p>
                <p className="font-semibold text-gray-900">
                  {cardData.eggPerYear}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="p-1.5 rounded-lg bg-purple-50">
                <Scale className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <div>
                <p className="text-gray-500">Weight</p>
                <p className="font-semibold text-gray-900">
                  {cardData.averageWeight} kg
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="p-1.5 rounded-lg bg-orange-50">
                <Palette className="h-3.5 w-3.5 text-orange-600" />
              </div>
              <div>
                <p className="text-gray-500">Egg Color</p>
                <p className="font-semibold text-gray-900 capitalize">
                  {cardData.eggColor}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="p-1.5 rounded-lg bg-green-50">
                <MapPin className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div>
                <p className="text-gray-500">Origin</p>
                <p className="font-semibold text-gray-900 line-clamp-1">
                  {cardData.originCountry}
                </p>
              </div>
            </div>
          </div>

          {/* Traits */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2 text-xs">
              <Feather className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Plumage:</span>
              <span className="font-medium text-gray-900 capitalize">
                {cardData.plumageColor}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Heart className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Temperament:</span>
              <span className="font-medium text-gray-900 capitalize">
                {cardData.temperament}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <Thermometer className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-gray-600">Climate:</span>
              <span className="font-medium text-gray-900 capitalize">
                {cardData.climateTolerance}
              </span>
            </div>
          </div>

          {/* Broodiness Badge */}
          {cardData.broodiness && (
            <div className="mt-auto pt-3 border-t border-gray-100">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-pink-50 text-pink-700 border border-pink-200">
                <Bird className="h-3 w-3 mr-1" />
                Broody
              </span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return {
    columns,
    fetchData,
    handleSetRefreshFn,
    handleNewAddRecord,
    handleCopy,
    cardComponent,
    checkboxActions,
  };
}
