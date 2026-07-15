export type ApiEnvelope<T> = {
  data: T;
  message: string;
  statusCode: number;
  success: boolean;
  timestamp: string;
};

export function unwrapApiData<T>(response: T | ApiEnvelope<T>): T {
  if (
    response &&
    typeof response === 'object' &&
    'success' in response &&
    'data' in response
  ) {
    return (response as ApiEnvelope<T>).data;
  }
  return response as T;
}
