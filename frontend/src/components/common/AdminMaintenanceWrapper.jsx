import React from 'react';
import { useLocation } from 'react-router-dom';
import useMaintenance from '../../hooks/useMaintenance';
import MaintenancePage from './MaintenancePage';

const AdminMaintenanceWrapper = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Check maintenance for both the current path and the parent admin path
  const checkMaintenance = async () => {
    try {
      // First check the exact current path
      const currentResponse = await fetch(`http://localhost:5000/api/maintenance/check${encodeURIComponent(currentPath)}`);
      if (currentResponse.ok) {
        const currentData = await currentResponse.json();
        if (currentData.data.is_maintenance) {
          return {
            isInMaintenance: true,
            maintenanceInfo: currentData.data.maintenance_info,
            loading: false
          };
        }
      }
      
      // If current path is not in maintenance, check the parent admin path
      if (currentPath.startsWith('/admin/')) {
        const adminResponse = await fetch(`http://localhost:5000/api/maintenance/check/admin`);
        if (adminResponse.ok) {
          const adminData = await adminResponse.json();
          if (adminData.data.is_maintenance) {
            return {
              isInMaintenance: true,
              maintenanceInfo: adminData.data.maintenance_info,
              loading: false
            };
          }
        }
      }
      
      return {
        isInMaintenance: false,
        maintenanceInfo: null,
        loading: false
      };
    } catch (error) {
      console.error('Error checking maintenance:', error);
      return {
        isInMaintenance: false,
        maintenanceInfo: null,
        loading: false
      };
    }
  };

  const [maintenanceState, setMaintenanceState] = React.useState({
    isInMaintenance: false,
    maintenanceInfo: null,
    loading: true
  });

  React.useEffect(() => {
    const checkMaintenanceStatus = async () => {
      setMaintenanceState({ isInMaintenance: false, maintenanceInfo: null, loading: true });
      const result = await checkMaintenance();
      setMaintenanceState(result);
    };

    checkMaintenanceStatus();
  }, [currentPath]);

  const retry = () => {
    const checkMaintenanceStatus = async () => {
      setMaintenanceState({ isInMaintenance: false, maintenanceInfo: null, loading: true });
      const result = await checkMaintenance();
      setMaintenanceState(result);
    };
    checkMaintenanceStatus();
  };

  // Show loading while checking maintenance status
  if (maintenanceState.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Show maintenance page if route is in maintenance
  if (maintenanceState.isInMaintenance) {
    return (
      <MaintenancePage 
        maintenanceInfo={maintenanceState.maintenanceInfo} 
        onRetry={retry}
      />
    );
  }

  // Show normal content if not in maintenance
  return children;
};

export default AdminMaintenanceWrapper; 