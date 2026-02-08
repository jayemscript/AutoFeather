'use client';

import { useState, useMemo, useEffect } from 'react';
import { IoWarningOutline, IoRefreshOutline } from 'react-icons/io5';
import { useRouter } from 'next/navigation';
import { extractErrorMessage } from '@/configs/api.helper';
import { getChangedFields } from '@/utils/form-data.helper';
import { showToastSuccess, showToastError } from '@/utils/toast-config';
import createDialogConfig from '@/utils/create-dialog-config';
import { createPredictionRecord } from '@/api/protected/predict/predict-api';
import { ChickenBreedInfo } from '@/api/protected/predict/chicken-breed-api.interface';
import { createChickenBreedRecord } from '@/api/protected/predict/chicken-breed.api';

export interface PredictionFormData {
  id?: string;
  title: string;
  description: string;
  image: string;
  chickenBreed: ChickenBreedInfo | null;
  temperature: number;
  humidity: number;
}

export interface PredictionPayload {
  id?: string;
  title: string;
  description: string;
  image: string;
  chickenBreed: any | null;
  temperature: number;
  humidity: number;
}

export default function usePredictionFormLogic(
  open: boolean,
  close: () => void,
  mode: 'add' | 'edit' = 'add',
  initialData: PredictionFormData | null = null,
  onSuccess?: () => void,
) {
  const [confirmType, setConfirmType] = useState<'close' | 'reset' | null>(
    null,
  );

  const getInitialFormData = (
    initialData?: PredictionFormData | null,
  ): PredictionFormData => ({
    title: initialData?.title ?? '',
    description: initialData?.description ?? '',
    image: initialData?.image ?? '',
    temperature: initialData?.temperature ?? 0,
    humidity: initialData?.humidity ?? 0,
    chickenBreed: initialData?.chickenBreed ?? null,
  });

  const [formData, setFormData] = useState<PredictionFormData>(
    getInitialFormData(initialData),
  );

  const router = useRouter();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

    const [tempLoading, setTempLoading] = useState(false);
  const [humLoading, setHumLoading] = useState(false);

  const getTempData = async () => {
    try {
      setTempLoading(true);
      const res = await fetch('http://localhost:5000/sensor/temp');
      const json = await res.json();

      const temperature = json?.data?.temperature;

      setFormData((prev) => ({
        ...prev,
        temperature,
      }));

      showToastSuccess('Temperature updated', `${temperature} °C`);
    } catch (err) {
      showToastError('Failed', 'Cannot fetch temperature');
    } finally {
      setTempLoading(false);
    }
  };

  const getHumData = async () => {
    try {
      setHumLoading(true);
      const res = await fetch('http://localhost:5000/sensor/hum');
      const json = await res.json();

      const humidity = json?.data?.humidity;

      setFormData((prev) => ({
        ...prev,
        humidity,
      }));

      showToastSuccess('Humidity updated', `${humidity} %`);
    } catch (err) {
      showToastError('Failed', 'Cannot fetch humidity');
    } finally {
      setHumLoading(false);
    }
  };


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

  const buildPayload = (data: PredictionFormData): PredictionPayload => {
    const { chickenBreed, ...rest } = data;

    return {
      ...rest,
      chickenBreed: chickenBreed?.id ?? null,
    };
  };

  async function submitData() {
    let response;
    if (mode === 'add') {
      const payload = buildPayload(formData);
      response = await createPredictionRecord(payload);
    } else if (mode === 'edit' && initialData?.id) {
      const updatedData = getChangedFields(initialData, formData, {
        skipEmpty: true,
        normalizeEmpty: true,
      });
      //   if (Object.keys(updatedData).length > 0) {
      //     response = await updateChickenBreedRecord(initialData.id, updatedData);
      //   }
      console.log('Updated Data:', updatedData);
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
        PredictionFormData,
        PredictionPayload
      >(initialData, formData, { skipEmpty: true, normalizeEmpty: true });

      const { image, chickenBreed, ...filteredUpdatedData } = updatedData;
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
    const { title, description, temperature, humidity } = formData;

    return (
      title.trim() !== '' &&
      description.trim() !== '' &&
      temperature !== undefined &&
      humidity !== undefined
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

        getTempData,
    getHumData,
    tempLoading,
    humLoading,
  };
}
