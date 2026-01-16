import { request } from './http';

const BASE_URL = process.env.NEXT_PUBLIC_BASIC_INFO_API!;

export interface Department {
  id: number;
  name: string;
}

export interface BasicInfoPayload {
  email: string;
  employmentType: string;
  location: string;
  notes?: string;
}

export function fetchDepartments(query: string) {
  return request<Department[]>(`${BASE_URL}/departments?name_like=${encodeURIComponent(query)}`);
}

export function submitBasicInfo(payload: BasicInfoPayload) {
  return request(`${BASE_URL}/basicInfo`, {
    method: 'POST',
    body: payload,
    delayMs: 3000,
  });
}

export function fetchBasicInfo(page = 1, limit = 10) {
  return request(`${BASE_URL}/basicInfo?_page=${page}&_limit=${limit}`);
}
