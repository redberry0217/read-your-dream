import { apiFetch } from '@/lib/api';
import type { InterpretRequest, InterpretResult } from '@/types/dream';
import { useMutation } from '@tanstack/react-query';

export const useInterpret = () => {
  return useMutation({
    mutationFn: (request: InterpretRequest) =>
      apiFetch<{ success: boolean; data: InterpretResult }>('/api/dream/interpret', {
        method: 'POST',
        body: JSON.stringify(request),
      }).then((res) => res.data),
  });
};
