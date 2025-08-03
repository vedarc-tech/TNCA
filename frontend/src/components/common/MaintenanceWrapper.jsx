import React from 'react';
import useMaintenance from '../../hooks/useMaintenance';
import MaintenancePage from './MaintenancePage';

const MaintenanceWrapper = ({ children, routePath }) => {
  const { maintenanceInfo, isInMaintenance, loading, retry } = useMaintenance(routePath);

  // Show loading while checking maintenance status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show maintenance page if route is in maintenance
  if (isInMaintenance) {
    return (
      <MaintenancePage 
        maintenanceInfo={maintenanceInfo} 
        onRetry={retry}
      />
    );
  }

  // Show normal content if not in maintenance
  return children;
};

export default MaintenanceWrapper; 