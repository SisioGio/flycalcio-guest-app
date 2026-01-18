
import { useQuery } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';

export const useScenarios = () => {
  return useQuery({
    queryKey: ['scenarios'],
    queryFn: async () => {
      const res = await apiClient.get('/scenario');
      return res.data.data;
    },
  });
};