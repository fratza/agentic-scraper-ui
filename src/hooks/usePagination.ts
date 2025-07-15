import { useState } from 'react';

interface UsePaginationProps {
  totalItems: number;
  itemsPerPage: number;
}

interface PaginationState {
  page: number;
  onPageChange: (e: { page: number }) => void;
  totalPages: number;
}

export const usePagination = ({ totalItems, itemsPerPage }: UsePaginationProps): PaginationState => {
  const [page, setPage] = useState(1);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const onPageChange = (e: { page: number }) => {
    setPage(e.page + 1); // PrimeReact pagination is 0-based, we want 1-based
  };

  return { page, onPageChange, totalPages };
};
