
import type {
  ApresentacaoAvaliacao,
  MotivoAvaliacaoValidade,
  ResultadoAvaliacaoValidade,
} from '../../types/validacao.types';

/**
 * CT-RF31-01 — Revisão 3
 *
 * Mapeamento centralizado dos motivos
 * consolidados do RF-30.
 *
 * A função não executa validações,
 * não modifica dados e não controla
 * estados da interface.
 */
const MENSAGENS: Record<
  MotivoAvaliacaoValidade,
  {
    mensagem: string;
    rotuloBotao: string;
  }
> = {
  DATA_APROVADA: {
    mensagem:
      'Data de validade validada com sucesso.',
    rotuloBotao: 'Prosseguir',
  },

  FORMATO_NAO_SUPORTADO: {
    mensagem:
      'O formato da data não foi reconhecido. Corrija a data informada.',
    rotuloBotao: 'Corrigir data',
  },

  DATA_INCOMPLETA: {
    mensagem:
      'A data está incompleta. Informe dia, mês e ano.',
    rotuloBotao: 'Corrigir data',
  },

  DATA_AMBIGUA: {
    mensagem:
      'Não foi possível determinar a data com segurança. Verifique e corrija a informação.',
    rotuloBotao: 'Corrigir data',
  },

  DATA_CALENDARIO_INVALIDA: {
    mensagem:
      'A data informada não existe no calendário.',
    rotuloBotao: 'Corrigir data',
  },

  PRODUTO_VENCIDO: {
    mensagem:
      'O produto está vencido e não pode ser cadastrado com esta validade.',
    rotuloBotao: 'Corrigir data',
  },

  FABRICACAO_INCOERENTE: {
    mensagem:
      'A data de fabricação identificada é posterior à validade. Verifique a validade informada. Se estiver correta, não será possível prosseguir com este cadastro.',
    rotuloBotao: 'Verificar validade',
  },

  FABRICACAO_REVISAO_NECESSARIA: {
    mensagem:
      'Há informações de fabricação que precisam de revisão. Verifique a validade informada. Se a inconsistência persistir, encerre esta tentativa.',
    rotuloBotao: 'Verificar validade',
  },
};

/**
 * RF-31 — Obtém a apresentação da avaliação.
 *
 * Preserva a ação recomendada pelo RF-30.
 */
export function obterApresentacaoAvaliacao(
  resultado: ResultadoAvaliacaoValidade
): ApresentacaoAvaliacao {
  const apresentacao = MENSAGENS[resultado.motivo];

  return {
    mensagem: apresentacao.mensagem,
    acao: resultado.acao_recomendada,
    rotuloBotao: apresentacao.rotuloBotao,
  };
}
