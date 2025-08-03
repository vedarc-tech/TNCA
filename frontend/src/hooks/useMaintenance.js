import { useState, useEffect } from 'react';

const useMaintenance = (routePath) => {
  const [maintenanceInfo, setMaintenanceInfo] = useState(null);
  const [isInMaintenance, setIsInMaintenance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkMaintenance = async () => {
      if (!routePath) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/maintenance/check/${encodeURIComponent(routePath)}`);
        
        if (response.ok) {
          const data = await response.json();
          setMaintenanceInfo(data.data.maintenance_info);
          setIsInMaintenance(data.data.is_maintenance);
        } else {
          setError('Failed to check maintenance status');
        }
      } catch (err) {
        setError('Error checking maintenance status');
        console.error('Error checking maintenance status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
  }, [routePath]);

  const retry = () => {
    setLoading(true);
    setError(null);
    // Re-check maintenance status
    const checkMaintenance = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/maintenance/check/${encodeURIComponent(routePath)}`);
        
        if (response.ok) {
          const data = await response.json();
          setMaintenanceInfo(data.data.maintenance_info);
          setIsInMaintenance(data.data.is_maintenance);
        } else {
          setError('Failed to check maintenance status');
        }
      } catch (err) {
        setError('Error checking maintenance status');
        console.error('Error checking maintenance status:', err);
      } finally {
        setLoading(false);
      }
    };

    checkMaintenance();
  };

  return {
    maintenanceInfo,
    isInMaintenance,
    loading,
    error,
    retry
  };
};

export default useMaintenance; 