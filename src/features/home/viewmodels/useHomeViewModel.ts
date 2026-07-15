import { useCallback, useEffect, useMemo, useState } from 'react';

import { useToast } from '../../../shared/toast/toast-provider';
import type { Service } from '../models/service-model';
import { getServices } from '../repositories/services-repository';

export function useHomeViewModel() {
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string>();
  const [isLoading, setLoading] = useState(true);
  const { showToast } = useToast();

  const loadServices = useCallback(async () => {
    setError(undefined);
    setLoading(true);
    try {
      setServices(await getServices());
    } catch (caughtError) {
      const message =
        caughtError instanceof Error ? caughtError.message : 'Unable to load services.';
      setError(message);
      showToast({ message, title: 'Services unavailable', tone: 'error' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadServices();
  }, [loadServices]);

  const filteredServices = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    if (!normalizedQuery) return services;

    return services.filter((service) =>
      [service.serviceName, service.serviceId, service.description]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase().includes(normalizedQuery)),
    );
  }, [searchQuery, services]);

  return {
    clearSearch: () => setSearchQuery(''),
    error,
    filteredServices,
    isLoading,
    loadServices,
    searchQuery,
    serviceCount: services.length,
    setSearchQuery,
  };
}
