import api, { extractPaged } from './api';
import { Necessidade, PagedResponse } from '../types';

export async function getNecessidades(page = 0, size = 50): Promise<PagedResponse<Necessidade>> {
  const response = await api.get('/necessidades', { params: { page, size, sort: 'tipo' } });
  return extractPaged<Necessidade>(response.data);
}

export async function getNecessidadeById(id: number): Promise<Necessidade> {
  const response = await api.get(`/necessidades/${id}`);
  return response.data as Necessidade;
}

export async function getNecessidadesCount(): Promise<number> {
  const response = await api.get('/necessidades', { params: { page: 0, size: 1 } });
  const paged = extractPaged<Necessidade>(response.data);
  return paged.totalElements;
}

export async function getNecessidadesByAbrigo(abrigoId: number): Promise<Necessidade[]> {
  const response = await api.get('/necessidades', {
    params: { abrigoId, page: 0, size: 100, sort: 'tipo' },
  });
  return extractPaged<Necessidade>(response.data).content;
}
