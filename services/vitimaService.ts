import api, { extractPaged } from './api';
import { Vitima, PagedResponse } from '../types';

export interface VitimaRequest {
  nome: string;
  cpf: string;
  dataNascimento: string;
  condicaoSaude?: string;
  abrigoId: number;
}

export async function getVitimas(page = 0, size = 50, abrigoId?: number): Promise<PagedResponse<Vitima>> {
  const params: Record<string, unknown> = { page, size, sort: 'nome' };
  if (abrigoId) params.abrigoId = abrigoId;
  const response = await api.get('/vitimas', { params });
  return extractPaged<Vitima>(response.data);
}

export async function getVitimaById(id: number): Promise<Vitima> {
  const response = await api.get(`/vitimas/${id}`);
  return response.data as Vitima;
}

export async function createVitima(data: VitimaRequest): Promise<Vitima> {
  const response = await api.post<Vitima>('/vitimas', data);
  return response.data;
}

export async function updateVitima(id: number, data: VitimaRequest): Promise<Vitima> {
  const response = await api.put<Vitima>(`/vitimas/${id}`, data);
  return response.data;
}

export async function deleteVitima(id: number): Promise<void> {
  await api.delete(`/vitimas/${id}`);
}

export async function getVitimasCount(): Promise<number> {
  const response = await api.get('/vitimas', { params: { page: 0, size: 1 } });
  const paged = extractPaged<Vitima>(response.data);
  return paged.totalElements;
}
