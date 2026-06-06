export type Role = 'ADMIN' | 'VOLUNTARIO';
export type StatusAbrigo = 'ATIVO' | 'INATIVO' | 'LOTADO';
export type StatusDoacao = 'PENDENTE_ENTREGA' | 'ENTREGUE' | 'CANCELADA';
export type StatusNecessidade = 'PENDENTE' | 'ATENDIDA';

export interface Endereco {
  rua: string;
  numero: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

export interface Abrigo {
  id: number;
  nome: string;
  capacidadeMaxima: number;
  latitude?: number;
  longitude?: number;
  status: StatusAbrigo;
  endereco: Endereco;
}

export interface Vitima {
  id: number;
  nome: string;
  cpf: string;
  dataNascimento: string;
  condicaoSaude?: string;
  abrigoId: number;
  abrigoNome: string;
}

export interface Doacao {
  id: number;
  tipo: string;
  descricao?: string;
  quantidade: number;
  dataDoacao: string;
  status: StatusDoacao;
  voluntarioId: number;
  voluntarioNome: string;
  abrigoId?: number;
  abrigoNome?: string;
  necessidadeId?: number;
  necessidadeDescricao?: string;
}

export interface Necessidade {
  id: number;
  tipo: string;
  descricao?: string;
  quantidadeNecessaria: number;
  status: StatusNecessidade;
  abrigoId: number;
  abrigoNome: string;
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Role;
}

export interface LoginResponse {
  token: string;
  tipo: string;
  email: string;
  role: Role;
}

export interface AuthUser {
  token: string;
  email: string;
  role: Role;
  id?: number;
  nome?: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface DashboardStats {
  totalAbrigos: number;
  totalVitimas: number;
  totalDoacoes: number;
  totalNecessidades: number;
}
