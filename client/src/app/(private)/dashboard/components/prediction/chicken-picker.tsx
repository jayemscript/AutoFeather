'use client';

import React, { useEffect, useState } from 'react';
import { ComboBox } from '@/components/customs/combobox/combo-box.component';
import { extractErrorMessage } from '@/configs/api.helper';
import { showToastError, showToastSuccess } from '@/utils/toast-config';
import { GetAllChickenBreedList } from '@/api/protected/predict/chicken-breed.api';
import { GiRoastChicken } from 'react-icons/gi';

interface ChickenPickerProps {
  value: any | null;
  onSelect: (c: any | null) => void;
}

export default function ChickenPicker({ value, onSelect }: ChickenPickerProps) {
  const [record, setRecord] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const selected =
    value && record.length > 0
      ? record.find((c) => c.id === value.id) || null
      : null;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await GetAllChickenBreedList();
        setRecord(res.data || []);
      } catch (e) {
        const message = extractErrorMessage(e);
        showToastError(
          'Operation Failed',
          extractErrorMessage(message),
          'bottom-right',
        );
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <ComboBox
      options={record}
      value={selected}
      onSelect={onSelect}
      searchKey={['chickenName', 'code']}
      loading={loading}
      placeholder="Search..."
      isClearable
      icon={<GiRoastChicken className='h-5 w-5'/>}
      getOptionLabel={(c: any) => `${c.code} ${c.chickenName}`}
    />
  );
}
