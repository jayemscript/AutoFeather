import React from 'react';
import type { Metadata } from 'next';
import ChickenBreedTable from './components/chicken-breed.table';
export const metadata: Metadata = {
  title: 'Chicken Breed Library',
  description: 'View all Information About Chicken Breeds',
};

export default function ChickenBreedLibraryPage() {
  return (
    <div>
      <ChickenBreedTable />
    </div>
  );
}
