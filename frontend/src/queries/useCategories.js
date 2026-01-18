import { useQuery } from '@tanstack/react-query';
import apiClient from '../utils/apiClient';

const fetchCategories = async () => {
  const res = await apiClient.get('/category');
  return res.data.data;
};

export const useCategories = () =>
  useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 10, // 10 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
  });
