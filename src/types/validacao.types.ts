
import type { DataCandidata } from "./validade.types";

/**
 * RF-25 — Representação de uma data normalizada.
 *
 * A normalização é estrutural e não garante
 * que a data exista no calendário.
 */
export interface DataNormalizada {
  data_original: string;
  dia: number;
  mes: number;
  ano: number;
  data_iso: string;
}

/**
 * RF-25 — Resultado da normalização estrutural.
 *
 * Sucesso: componentes numéricos e representação ISO.
 * Falha: texto original e motivo da impossibilidade
 * de normalização.
 */
export type ResultadoNormalizacao =
  | {
      sucesso: true;
      valor: DataNormalizada;
    }
  | {
      sucesso: false;
      data_original: string;
      motivo:
        | 'FORMATO_NAO_SUPORTADO'
        | 'DATA_INCOMPLETA';
    };

/**
 * RF-26 — Motivos de rejeição pelo calendário gregoriano.
 */
export type MotivoDataInvalida =
  | 'MES_INVALIDO'
  | 'DIA_INVALIDO'
  | 'DIA_INEXISTENTE_NO_MES';

/**
 * RF-26 — Resultado da validação calendárica.
 *
 * Preserva a data normalizada tanto no sucesso
 * quanto na rejeição.
 */
export type ResultadoValidacaoCalendario =
  | {
      valida: true;
      data: DataNormalizada;
    }
  | {
      valida: false;
      data: DataNormalizada;
      motivo: MotivoDataInvalida;
    };


export type SituacaoValidade =
  | 'VENCIDO'
  | 'VENCE_HOJE'
  | 'DENTRO_DA_VALIDADE';

export interface ResultadoVerificacaoVencimento {
  data_validade: string;
  data_referencia: string;
  situacao: SituacaoValidade;
  permite_avancar: boolean;
}


export type MotivoRejeicaoRF29 =
  | 'DIA_AUSENTE'
  | 'MES_AUSENTE'
  | 'ANO_AUSENTE'
  | 'COMPONENTE_ILEGIVEL'
  | 'INTERPRETACAO_AMBIGUA'
  | 'COMPONENTES_INSUFICIENTES';

export interface ResultadoRejeicaoRF29 {
  aceita: false;
  data_original: string;
  motivo: MotivoRejeicaoRF29;
  requer_correcao_manual: true;
}

export interface ContextoAvaliacaoRF29 {
  interpretacaoAmbigua?: boolean;
}


/**
 * RF-28 — Verificação opcional de coerência
 * entre fabricação e validade.
 *
 * Contrato: CT-RF28-01
 * Decisão: DEC-G4-15 — Alternativa A
 */

/**
 * Situações possíveis da avaliação.
 */
export type SituacaoCoerenciaFabricacao =
  | 'SEM_FABRICACAO'
  | 'COERENTE'
  | 'INCOERENTE'
  | 'REVISAO_NECESSARIA';

/**
 * Entrada da verificação.
 *
 * Pré-condições:
 * - validade normalizada pelo RF-25;
 * - validade validada pelo RF-26;
 * - candidatas provenientes do JSON V2.
 */
export interface EntradaVerificacaoFabricacao {
  validade: DataNormalizada;
  candidatas: DataCandidata[];
}

/**
 * Resultado da avaliação de coerência.
 *
 * A verificação não determina a aprovação
 * final do cadastro.
 */
export type ResultadoCoerenciaFabricacao =
  | {
      situacao: 'SEM_FABRICACAO';
      requer_revisao: false;
      fabricacoes_consideradas: string[];
    }
  | {
      situacao: 'COERENTE';
      requer_revisao: false;
      fabricacoes_consideradas: string[];
    }
  | {
      situacao: 'INCOERENTE';
      requer_revisao: true;
      fabricacoes_consideradas: string[];
    }
  | {
      situacao: 'REVISAO_NECESSARIA';
      requer_revisao: true;
      fabricacoes_consideradas: string[];
    };

    /**
 * RF28-02 — Preparação das candidatas
 * de fabricação.
 */

export interface FabricacaoNormalizada {
  data_iso: string;
  representacoes_originais: string[];
}

export interface ResultadoPreparacaoFabricacao {
  fabricacoes: FabricacaoNormalizada[];
  candidatas_invalidas: string[];
  candidatas_originais: string[];
}



/**
 * RF-30 — Consolidação da avaliação de validade.
 *
 * CT-RF30-01 — Revisão 5 (congelada)
 * DEC-G4-17 a DEC-G4-21
 */

/**
 * Situações possíveis da avaliação consolidada.
 */
export type SituacaoAvaliacaoValidade =
  | 'APROVADO'
  | 'REJEITADO'
  | 'REVISAO_NECESSARIA';

/**
 * Próxima ação recomendada ao fluxo.
 */
export type AcaoRecomendada =
  | 'PROSSEGUIR'
  | 'CORRIGIR_DATA'
  | 'REVISAR_FABRICACAO';

/**
 * Motivos consolidados.
 *
 * Os detalhes técnicos permanecem nos
 * resultados individuais dos RF anteriores.
 */
export type MotivoAvaliacaoValidade =
  | 'DATA_APROVADA'
  | 'FORMATO_NAO_SUPORTADO'
  | 'DATA_INCOMPLETA'
  | 'DATA_AMBIGUA'
  | 'DATA_CALENDARIO_INVALIDA'
  | 'PRODUTO_VENCIDO'
  | 'FABRICACAO_INCOERENTE'
  | 'FABRICACAO_REVISAO_NECESSARIA';

/**
 * Entrada da avaliação.
 *
 * dataConfirmada:
 *   data confirmada ou corrigida pelo operador.
 *
 * candidatas:
 *   datas identificadas pela IA, utilizadas
 *   exclusivamente nas verificações aplicáveis.
 *
 * dataReferenciaISO:
 *   data civil de referência no formato AAAA-MM-DD.
 *
 * interpretacaoAmbigua:
 *   sinalização explícita de ambiguidade,
 *   conforme contrato do RF-29.
 */
export interface EntradaAvaliacaoValidade {
  dataConfirmada: string;
  candidatas: DataCandidata[];
  dataReferenciaISO: string;
  interpretacaoAmbigua?: boolean;
}

/**
 * Resultado consolidado.
 *
 * Somente APROVADO disponibiliza
 * a data normalizada para prosseguimento.
 */
export type ResultadoAvaliacaoValidade =
  | {
      situacao: 'APROVADO';
      motivo: 'DATA_APROVADA';
      acao_recomendada: 'PROSSEGUIR';
      data_normalizada: DataNormalizada;
    }
  | {
      situacao: 'REJEITADO';
      motivo:
        | 'FORMATO_NAO_SUPORTADO'
        | 'DATA_CALENDARIO_INVALIDA'
        | 'PRODUTO_VENCIDO';
      acao_recomendada: 'CORRIGIR_DATA';
      data_normalizada?: never;
    }
  | {
      situacao: 'REVISAO_NECESSARIA';
      motivo:
        | 'DATA_INCOMPLETA'
        | 'DATA_AMBIGUA';
      acao_recomendada: 'CORRIGIR_DATA';
      data_normalizada?: never;
    }
  | {
      situacao: 'REVISAO_NECESSARIA';
      motivo:
        | 'FABRICACAO_INCOERENTE'
        | 'FABRICACAO_REVISAO_NECESSARIA';
      acao_recomendada: 'REVISAR_FABRICACAO';
      data_normalizada?: never;
    };

/**
 * RF-31 — Apresentação da avaliação de validade.
 *
 * CT-RF31-01 — Revisão 3
 * DEC-G4-22, DEC-G4-23 e DEC-G4-24.
 *
 * Contrato responsável exclusivamente
 * pelas informações de apresentação.
 */
export interface ApresentacaoAvaliacao {
  mensagem: string;
  acao: AcaoRecomendada;
  rotuloBotao: string;
}