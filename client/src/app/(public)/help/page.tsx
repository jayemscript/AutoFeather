import React from 'react';
import HelpPageContent from '@/components/pages/help-page.content';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help & Guides | AutoFeather',
  description:
    'Access guides and instructions for AutoFeather, including monitoring feather density, thermal comfort, fertility predictions, and managing automated controls effectively.',
};

export default function HelpPage() {
  return (
    <div>
      <HelpPageContent />
    </div>
  );
}
