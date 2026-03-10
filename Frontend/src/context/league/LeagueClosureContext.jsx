import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import client from '../../api/axios';
import { LoginContext } from '../login/LoginContext';

export const LeagueClosureContext = createContext();

export const LeagueClosureProvider = ({ children }) => {
  const { auth, authReady } = useContext(LoginContext);
  const [status, setStatus] = useState({ required: false, requiredPeriod: null, closedArchive: null });
  const [loading, setLoading] = useState(false);

  const refreshClosureStatus = useCallback(async () => {
    if (!authReady || auth !== 'admin') return;

    setLoading(true);
    try {
      const response = await client.get('/league/closure-status');
      setStatus(response.data || { required: false, requiredPeriod: null, closedArchive: null });
    } catch (_error) {
      setStatus({ required: false, requiredPeriod: null, closedArchive: null });
    } finally {
      setLoading(false);
    }
  }, [auth, authReady]);

  useEffect(() => {
    if (!authReady) return;

    if (auth !== 'admin') {
      setStatus({ required: false, requiredPeriod: null, closedArchive: null });
      return;
    }

    refreshClosureStatus();
  }, [auth, authReady, refreshClosureStatus]);

  const value = useMemo(() => ({
    closureRequired: !!status?.required,
    closureStatus: status,
    closureLoading: loading,
    refreshClosureStatus
  }), [status, loading, refreshClosureStatus]);

  return (
    <LeagueClosureContext.Provider value={value}>
      {children}
    </LeagueClosureContext.Provider>
  );
};
