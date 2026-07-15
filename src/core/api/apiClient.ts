import { fetch } from 'expo/fetch';

import { env } from '../config/env';
import { getSecureItem } from '../storage/secureStore';
import { storageKeys } from '../storage/storageKeys';
import { ApiError } from './ApiError';

type ApiRequestOptions = Omit<RequestInit, 'body'> & {
  authenticated?: boolean;
  body?: unknown;
  timeoutMs?: number;
};

type ErrorBody = { code?: string; error?: string; message?: string };

const defaultTimeoutMs = 15_000;

function logApiError(path: string, method: string, error: ApiError) {
  if (!__DEV__) return;

  console.error('[API Error]', {
    code: error.code,
    endpoint: path.split('?')[0],
    message: error.message,
    method,
    status: error.status,
  });
}

function createUrl(path: string) {
  return new URL(path.replace(/^\//, ''), env.apiBaseUrl).toString();
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    throw new ApiError('The server returned an invalid response.', response.status);
  }
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const { authenticated = false, body, headers, timeoutMs = defaultTimeoutMs, ...requestInit } = options;
  const method = requestInit.method?.toUpperCase() ?? 'GET';
  const token = authenticated ? await getSecureItem(storageKeys.authToken) : null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(createUrl(path), {
      ...requestInit,
      body: body === undefined ? undefined : JSON.stringify(body),
      headers: {
        Accept: 'application/json',
        ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      signal: controller.signal,
    });
    const data = await readJson(response);

    if (!response.ok) {
      const error = (data ?? {}) as ErrorBody;
      throw new ApiError(
        error.message ?? error.error ?? 'Request failed. Please try again.',
        response.status,
        error.code,
      );
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      logApiError(path, method, error);
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      const timeoutError = new ApiError('The request timed out. Please try again.', 0, 'TIMEOUT');
      logApiError(path, method, timeoutError);
      throw timeoutError;
    }
    const networkError = new ApiError(
      'Unable to connect. Check your internet connection.',
      0,
      'NETWORK_ERROR',
    );
    logApiError(path, method, networkError);
    throw networkError;
  } finally {
    clearTimeout(timeout);
  }
}
