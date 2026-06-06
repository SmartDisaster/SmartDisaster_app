import api, { extractPaged } from './api';
import { Doacao, PagedResponse } from '../types';

export interface DoacaoRequest {
  tipo: string;
  descricao?: string;
  quantidade: number;
  abrigoId: number;
  necessidadeId: number;
  voluntarioId: number;
}

export async function getDoacoes(page = 0, size = 50): Promise<PagedResponse<Doacao>> {
  const response = await api.get('/doacoes', { params: { page, size } });
  return extractPaged<Doacao>(response.data);
}

export async function getDoacaoById(id: number): Promise<Doacao> {
  const response = await api.get(`/doacoes/${id}`);
  return response.data as Doacao;
}

export async function getDoacoesByAbrigo(abrigoId: number, page = 0, size = 50): Promise<PagedResponse<Doacao>> {
  const response = await api.get(`/doacoes/abrigo/${abrigoId}`, { params: { page, size } });
  return extractPaged<Doacao>(response.data);
}

export async function getDoacoesByVoluntario(voluntarioId: number, page = 0, size = 50): Promise<PagedResponse<Doacao>> {
  const response = await api.get(`/doacoes/voluntario/${voluntarioId}`, { params: { page, size } });
  return extractPaged<Doacao>(response.data);
}

export async function createDoacao(data: DoacaoRequest): Promise<Doacao> {
  const response = await api.post<Doacao>('/doacoes', data);
  return response.data;
}

export async function marcarEntregue(id: number): Promise<Doacao> {
  const response = await api.patch<Doacao>(`/doacoes/${id}/entregar`);
  return response.data;
}

export async function cancelarDoacao(id: number): Promise<Doacao> {
  const response = await api.patch<Doacao>(`/doacoes/${id}/cancelar`);
  return response.data;
}

export async function deleteDoacao(id: number): Promise<void> {
  await api.delete(`/doacoes/${id}`);
}

export async function getDocacoesCount(): Promise<number> {
  const response = await api.get('/doacoes', { params: { page: 0, size: 1 } });
  const paged = extractPaged<Doacao>(response.data);
  return paged.totalElements;
}
