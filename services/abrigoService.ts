import api, { extractPaged, extractEmbedded } from './api';
import { Abrigo, PagedResponse } from '../types';

export async function getAbrigos(page = 0, size = 50): Promise<PagedResponse<Abrigo>> {
  const response = await api.get('/abrigos', { params: { page, size, sort: 'nome' } });
  return extractPaged<Abrigo>(response.data);
}

export async function getAbrigoById(id: number): Promise<Abrigo> {
  const response = await api.get(`/abrigos/${id}`);
  return response.data as Abrigo;
}

export async function getAbrigosCount(): Promise<number> {
  const response = await api.get('/abrigos', { params: { page: 0, size: 1 } });
  const paged = extractPaged<Abrigo>(response.data);
  return paged.totalElements;
}
