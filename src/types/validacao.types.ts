
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