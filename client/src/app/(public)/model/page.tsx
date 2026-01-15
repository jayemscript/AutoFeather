import React from 'react';
// import AboutPageContent from "@/components/pages/about-page-content";
import ModelPageContent from '@/components/pages/model-page.content';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fuzzy Logic Model | AutoFeather',
  description:
    'Explore the fuzzy logic model used in AutoFeather for feather density and thermal comfort fertility prediction, including inputs, rules, and inference process.',
};

export default function page() {
  return (
    <div>
      <ModelPageContent />
    </div>
  );
}
