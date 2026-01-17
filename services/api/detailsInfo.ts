import { Details } from '@/types';
import { request } from './http';
import { ResponseWithPagination } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_DETAILS_INFO_API!;

export interface Location {
  id: number;
  name: string;
}

export interface DetailsPayload {
  email: string;
  employeeId: string;
  photo?: string;
  employmentType?: string;
  officeLocation?: string;
  notes?: string;
}

export function fetchLocations(query: string) {
  return request<Location[]>(`${BASE_URL}/locations?name_like=${encodeURIComponent(query)}`);
}

export function submitDetails(payload: DetailsPayload) {
  return request(`${BASE_URL}/details`, {
    method: 'POST',
    body: payload,
    delayMs: 3000,
  });
}

export function fetchDetails(page = 1, limit = 10): Promise<ResponseWithPagination<Details[]>> {
  return request(`${BASE_URL}/details?_page=${page}&_per_page=${limit}`);
}
