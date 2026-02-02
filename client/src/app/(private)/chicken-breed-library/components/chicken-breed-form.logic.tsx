'use client';

import { useState, useMemo, useEffect } from 'react';
import { IoWarningOutline, IoRefreshOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import { extractErrorMessage } from '@/configs/api.helper';
import { getChangedFields } from '@/utils/form-data.helper';
import { showToastSuccess, showToastError } from '@/utils/toast-config';
import createDialogConfig from '@/utils/create-dialog-config';
import {
  createChickenBreedRecord,
  updateChickenBreedRecord,
} from '@/api/protected/predict/chicken-breed.api';
import { BreedPurposeEnum } from '@/api/protected/predict/chicken-breed-api.interface';

export interface ChickenBreedFormData {
  id?: string;
  code: string;
  chickenName: string;
  image: string;
  scientificName: string;
  originCountry: string;
  description: string;
  purpose: BreedPurposeEnum;
  eggColor: string;
  eggPerYear: number;
  meatType: string;
  plumageColor: string;
  combType: string;
  averageWeight: number;
  temperament: string;
  climateTolerance: string;
  broodiness: boolean;
}

export interface ChickenBreedPayload {
  id?: string;
  code: string;
  chickenName: string;
  image: string;
  scientificName: string;
  originCountry: string;
  description: string;
  purpose: BreedPurposeEnum;
  eggColor: string;
  eggPerYear: number;
  meatType: string;
  plumageColor: string;
  combType: string;
  averageWeight: number;
  temperament: string;
  climateTolerance: string;
  broodiness: boolean;
}

export default function useChickenBreedFormLogic(
  open: boolean,
  close: () => void,
  mode: 'add' | 'edit' = 'add',
  initialData: ChickenBreedFormData | null = null,
  onSuccess?: () => void,
) {
  const [confirmType, setConfirmType] = useState<'close' | 'reset' | null>(
    null,
  );

  const getInitialFormData = (
    initialData?: ChickenBreedFormData | null,
  ): ChickenBreedFormData => ({
    code: initialData?.code ?? '',
    chickenName: initialData?.chickenName ?? '',
    image: initialData?.image ?? '',
    scientificName: initialData?.scientificName ?? '',
    originCountry: initialData?.originCountry ?? '',
    description: initialData?.description ?? '',
    purpose: initialData?.purpose ?? BreedPurposeEnum.DUAL,
    eggColor: initialData?.eggColor ?? '',
    eggPerYear: initialData?.eggPerYear ?? 0,
    meatType: initialData?.meatType ?? '',
    plumageColor: initialData?.plumageColor ?? '',
    combType: initialData?.combType ?? '',
    averageWeight: initialData?.averageWeight ?? 0,
    temperament: initialData?.temperament ?? '',
    climateTolerance: initialData?.climateTolerance ?? '',
    broodiness: initialData?.broodiness ?? false,
  });

  const [formData, setFormData] = useState<ChickenBreedFormData>(
    getInitialFormData(initialData),
  );
  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const handleReset = () => {
    setFormData(getInitialFormData(initialData));
    setIsConfirmed(false);
    showToastSuccess('Form Reset', 'Form Reset Successfully', 'top-center');
  };

  const dialogConfig = {
    close: createDialogConfig(
      'Discard changes?',
      'Are you sure you want to close this form? Unsaved changes will be lost.',
      'Yes, Close',
      <IoWarningOutline className="w-8 h-8 text-yellow-500" />,
      () => close(),
    ),
    reset: createDialogConfig(
      'Reset form?',
      'Are you sure you want to reset the form? All input will be cleared.',
      'Yes, Reset',
      <IoRefreshOutline className="w-8 h-8 text-blue-500" />,
      () => handleReset(),
    ),
  };

  const currentDialog = confirmType ? dialogConfig[confirmType] : null;
  const openConfirm = (type: 'close' | 'reset') => setConfirmType(type);
  const handleCancel = () => setConfirmType(null);
  const handleConfirm = () => {
    if (confirmType) {
      dialogConfig[confirmType].action();
    }
    setConfirmType(null);
  };

  useEffect(() => {
    if (open) {
      setFormData(getInitialFormData(initialData));
    }
  }, [open, initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function submitData() {
    let response;
    if (mode === 'add') {
      response = await createChickenBreedRecord({ ...formData });
    } else if (mode === 'edit' && initialData?.id) {
      const updatedData = getChangedFields(initialData, formData, {
        skipEmpty: true,
        normalizeEmpty: true,
      });
      if (Object.keys(updatedData).length > 0) {
        response = await updateChickenBreedRecord(initialData.id, updatedData);
      }
    }
    return response;
  }

  const handleSubmit = async (e?: React.FormEvent | boolean) => {
    if (typeof e !== 'boolean') e?.preventDefault();
    setLoading(true);
    try {
      const response = await submitData();
      close();
      onSuccess?.();
      setError('');
    } catch (error: unknown) {
      showToastError(
        'Operation Failed',
        extractErrorMessage(error),
        'bottom-right',
      );
    } finally {
      setLoading(false);
    }
  };

  const previewData = useMemo(() => {
    if (mode === 'edit' && initialData) {
      const updatedData = getChangedFields<
        ChickenBreedFormData,
        ChickenBreedPayload
      >(initialData, formData, { skipEmpty: true, normalizeEmpty: true });
      const { image, ...filteredUpdatedData } = updatedData;
      return {
        before: initialData,
        after: { ...initialData, ...filteredUpdatedData },
      };
    }
    return {
      before: formData,
      after: formData,
    };
  }, [mode, formData, initialData]);

  const isFormValid = useMemo(() => {
    const { code, chickenName, scientificName, originCountry, purpose } =
      formData;

    return (
      code.trim() !== '' &&
      chickenName.trim() !== '' &&
      scientificName.trim() !== '' &&
      originCountry.trim() !== '' &&
      purpose !== undefined
    );
  }, [formData]);

  const hasChanges = useMemo(() => {
    if (mode === 'add') return true;
    if (!initialData) return false;
    const updatedFields = getChangedFields(initialData, formData, {
      skipEmpty: true,
      normalizeEmpty: true,
    });
    return Object.keys(updatedFields).length > 0;
  }, [formData, initialData, mode]);

  return {
    confirmType,
    currentDialog,
    openConfirm,
    handleCancel,
    handleConfirm,
    handleSubmit,
    handleReset,
    formData,
    setFormData,
    handleChange,
    previewData,
    isFormValid,
    hasChanges,
    setIsConfirmed,
    setShowPreview,
    showPreview,
    isConfirmed,
    loading,
  };
}
