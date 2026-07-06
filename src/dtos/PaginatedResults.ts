export interface PaginatedResult<T> {
  totalResult: number;
  page: number;
  results: T[];
}
