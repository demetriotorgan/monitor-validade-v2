// src/services/cadastroValidadeApi.ts
import api from './api';
import type { Produto } from '../types/produto.types';
import { buildValidadeBackendPayload } from '../utils/validade/buildValidadePayload';
import type { ResultadoAvaliacaoValidade } from '../types/validacao.types';

export async function cadastrarValidade(produto: Produto, dadosAvaliacao: ResultadoAvaliacaoValidade): Promise<void> {
  const payload = buildValidadeBackendPayload(produto, dadosAvaliacao);

  await api.post('/salvarValidade', payload);
}
