import React from 'react';
import AboutPageContent from '@/components/pages/about-page-content';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About AutoFeather',
  description:
    'Learn about the AutoFeather system, its features, and how it helps maintain optimal feather density, thermal comfort, and fertility in poultry farming.',
};
export default function page() {
  return (
    <div>
      <AboutPageContent />
    </div>
  );
}
