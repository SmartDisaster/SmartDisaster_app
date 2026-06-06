import api, { extractPaged } from './api';
import { Abrigo, Endereco, PagedResponse } from '../types';

export interface AbrigoRequest {
  nome: string;
  capacidadeMaxima: number;
  status: 'ATIVO' | 'INATIVO' | 'LOTADO';
  latitude?: number;
  longitude?: number;
  endereco: Endereco;
}

export async function getAbrigos(page = 0, size = 50): Promise<PagedResponse<Abrigo>> {
  const response = await api.get('/abrigos', { params: { page, size, sort: 'nome' } });
  return extractPaged<Abrigo>(response.data);
}

export async function getAbrigoById(id: number): Promise<Abrigo> {
  const response = await api.get(`/abrigos/${id}`);
  return response.data as Abrigo;
}

export async function createAbrigo(data: AbrigoRequest): Promise<Abrigo> {
  const response = await api.post<Abrigo>('/abrigos', data);
  return response.data;
}

export async function updateAbrigo(id: number, data: AbrigoRequest): Promise<Abrigo> {
  const response = await api.put<Abrigo>(`/abrigos/${id}`, data);
  return response.data;
}

export async function deleteAbrigo(id: number): Promise<void> {
  await api.delete(`/abrigos/${id}`);
}

export async function getAbrigosCount(): Promise<number> {
  const response = await api.get('/abrigos', { params: { page: 0, size: 1 } });
  const paged = extractPaged<Abrigo>(response.data);
  return paged.totalElements;
}
