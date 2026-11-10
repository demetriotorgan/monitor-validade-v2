
import type {
  DataNormalizada,
  ResultadoVerificacaoVencimento,
  SituacaoValidade,
} from '../../types/validacao.types';

/**
 * RF-27 — Compara datas civis.
 *
 * Pré-condições:
 * - Data normalizada e validada pelo calendário.
 * - Referência ISO válida: AAAA-MM-DD.
 *
 * Não utiliza horário ou fuso na comparação.
 */
export function verificarVencimento(
  data: DataNormalizada,
  dataReferenciaISO: string
): ResultadoVerificacaoVencimento {
  const dataValidadeISO = data.data_iso;

  let situacao: SituacaoValidade;

  if (dataValidadeISO < dataReferenciaISO) {
    situacao = 'VENCIDO';
  } else if (dataValidadeISO === dataReferenciaISO) {
    situacao = 'VENCE_HOJE';
  } else {
    situacao = 'DENTRO_DA_VALIDADE';
  }

  return {
    data_validade: dataValidadeISO,
    data_referencia: dataReferenciaISO,
    situacao,
    permite_avancar: situacao !== 'VENCIDO',
  };
}
