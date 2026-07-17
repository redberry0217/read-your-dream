import { api } from '@/lib/api';
import type { InterpretRequest, InterpretResult } from '@/types/dream';
import { useMutation } from '@tanstack/react-query';

export const postInterpret = async (
  request: InterpretRequest,
): Promise<InterpretResult> => {
  const { data } = await api.post<{ success: boolean; data: InterpretResult }>(
    '/api/dream/interpret',
    request,
  );
  return data.data;
};

export const useInterpret = () => {
  return useMutation({
    mutationFn: postInterpret,
  });
};
