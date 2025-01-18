import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { useUpdateQueryParam } from './useUpdateQueryParam';

export const useAppSearchParams = () => {
  const searchParams = useSearchParams();
  const updateQueryParam = useUpdateQueryParam();

  const api = useMemo(() => {
    const startDate = searchParams.get('startDate') ?? undefined;
    const endDate = searchParams.get('endDate') ?? undefined;
    const groupId = searchParams.get('groupId') ?? '';

    return {
      startDate,
      endDate,
      groupId,
      searchParams,
      updateQueryParam,
    };
  }, [searchParams, updateQueryParam]);

  return {
    ...api,
  };
};
