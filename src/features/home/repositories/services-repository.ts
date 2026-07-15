import type { ApiEnvelope } from '../../../core/api/api-response';
import { unwrapApiData } from '../../../core/api/api-response';
import { apiRequest } from '../../../core/api/apiClient';
import { env } from '../../../core/config/env';
import type { Service } from '../models/service-model';

export async function getServices() {
  const response = await apiRequest<Service[] | ApiEnvelope<Service[]>>(env.endpoints.services, {
    authenticated: true,
    method: 'GET',
  });
  return unwrapApiData(response);
}
