export interface Pagination {
  first: number;
  items: number;
  last: number;
  pages: number;
  next: null |number;
  prev: null | number;
}

export interface ResponseWithPagination<T> extends Pagination {
  data: T;
}