
import type {
  EntradaAvaliacaoValidade,
  ResultadoAvaliacaoValidade,
} from '../../types/validacao.types';

import { normalizarData } from './normalizarData';
import { avaliarDataIncompleta } from './avaliarDataIncompleta';
import { validarCalendario } from './validarCalendario';
import { verificarVencimento } from './verificarVencimento';
import { verificarCoerenciaFabricacao } from './verificarCoerenciaFabricacao';

/**
 * RF-30 — Consolidação da avaliação de validade.
 *
 * CT-RF30-01 — Revisão 5
 * DEC-G4-17 a DEC-G4-21
 *
 * Função determinística, sem efeitos colaterais.
 *
 * Não executa IA.
 * Não altera datas automaticamente.
 * Não registra produtos.
 */
export function avaliarValidade(
  entrada: EntradaAvaliacaoValidade
): ResultadoAvaliacaoValidade {

  const {
    dataConfirmada,
    candidatas,
    dataReferenciaISO,
    interpretacaoAmbigua,
  } = entrada;

  // RF-25 — Normalização determinística.
  const normalizacao = normalizarData(dataConfirmada);

  // RF-29 — Incompletude e ambiguidade.
  const incompletude = avaliarDataIncompleta(
    normalizacao,
    { interpretacaoAmbigua }
  );

  if (incompletude !== null) {
    return {
      situacao: 'REVISAO_NECESSARIA',
      motivo:
        incompletude.motivo === 'INTERPRETACAO_AMBIGUA'
          ? 'DATA_AMBIGUA'
          : 'DATA_INCOMPLETA',
      acao_recomendada: 'CORRIGIR_DATA',
    };
  }

  // RF-25 — Formato não suportado.
  if (!normalizacao.sucesso) {
    return {
      situacao: 'REJEITADO',
      motivo: 'FORMATO_NAO_SUPORTADO',
      acao_recomendada: 'CORRIGIR_DATA',
    };
  }

  const validade = normalizacao.valor;

  // RF-26 — Validação do calendário.
  const calendario = validarCalendario(validade);

  if (!calendario.valida) {
    return {
      situacao: 'REJEITADO',
      motivo: 'DATA_CALENDARIO_INVALIDA',
      acao_recomendada: 'CORRIGIR_DATA',
    };
  }

  // RF-27 — Verificação de vencimento.
  const vencimento = verificarVencimento(
    validade,
    dataReferenciaISO
  );

  if (vencimento.situacao === 'VENCIDO') {
    return {
      situacao: 'REJEITADO',
      motivo: 'PRODUTO_VENCIDO',
      acao_recomendada: 'CORRIGIR_DATA',
    };
  }

  // RF-28 — Coerência com fabricação.
  const fabricacao = verificarCoerenciaFabricacao({
    validade,
    candidatas,
  });

  if (fabricacao.situacao === 'INCOERENTE') {
    return {
      situacao: 'REVISAO_NECESSARIA',
      motivo: 'FABRICACAO_INCOERENTE',
      acao_recomendada: 'REVISAR_FABRICACAO',
    };
  }

  if (fabricacao.situacao === 'REVISAO_NECESSARIA') {
    return {
      situacao: 'REVISAO_NECESSARIA',
      motivo: 'FABRICACAO_REVISAO_NECESSARIA',
      acao_recomendada: 'REVISAR_FABRICACAO',
    };
  }

  // Todas as verificações foram superadas.
  return {
    situacao: 'APROVADO',
    motivo: 'DATA_APROVADA',
    acao_recomendada: 'PROSSEGUIR',
    data_normalizada: validade,
  };
}
