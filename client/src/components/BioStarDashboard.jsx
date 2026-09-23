import React from 'react';
import BioStarPdfSpecificationView from './BioStarPdfSpecificationView';
import { useBankFilters } from './filters/FilterContext';

/**
 * Enterprise Banking Command Center Dashboard
 * Pubali Bank PLC · Biometric & Access Control
 */
export default function BioStarDashboard({ onNavigate }) {
  const {
    region,
    branch,
    searchQuery,
    moduleFilters,
    tableColumnFilters
  } = useBankFilters();

  return (
    <BioStarPdfSpecificationView
      initialView="overview"
      onNavigateParent={onNavigate}
    />
  );
}
