import React from 'react';
// import AboutPageContent from "@/components/pages/about-page-content";
import DocumentationPageContent from '@/components/pages/documentation-page.content';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Documentation | AutoFeather',
  description:
    'Explore the AutoFeather system documentation, including how it monitors feather density, thermal comfort, and fertility using real-time data and automated aeration control.',
};

export default function page() {
  return (
    <div>
      <DocumentationPageContent />
    </div>
  );
}
