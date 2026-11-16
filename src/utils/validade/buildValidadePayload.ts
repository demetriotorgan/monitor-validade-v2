// src/utils/validade/buildValidadePayload.ts
import type { Produto } from '../../types/produto.types';
import type { ResultadoAvaliacaoValidade } from '../../types/validacao.types';
import type { ValidadePayloadBackend } from '../../types/validade.types';

export function buildValidadeBackendPayload(produto: Produto, dadosAvaliacao: ResultadoAvaliacaoValidade, diasAntecedencia: number): ValidadePayloadBackend {
    
  if (!dadosAvaliacao.data_normalizada) {
    throw new Error(
      'Não é possível construir payload de validade sem data normalizada.',
    );
  }

   if (!Number.isInteger(diasAntecedencia) || diasAntecedencia <= 0) {
    throw new Error(
      'Dias de antecedencia deve ser um número inteiro maior que zero.',
    );
  }

  return {
    data: {
      ano: dadosAvaliacao.data_normalizada.ano,
      mes: dadosAvaliacao.data_normalizada.mes,
      dia: dadosAvaliacao.data_normalizada.dia,
      data_iso: dadosAvaliacao.data_normalizada.data_iso,
      data_original: dadosAvaliacao.data_normalizada.data_original,
    },
    produto: {
      _id_produto: produto._id,
      codigo_barras: produto.codigoBarras,
      nome: produto.nome,
    },
    alerta: {
      dias_antecedencia: diasAntecedencia,
    },
    ml: {
      situacao: dadosAvaliacao.situacao,
      motivo: dadosAvaliacao.motivo,
      acao_recomendada: dadosAvaliacao.acao_recomendada,
    },
  };
}
