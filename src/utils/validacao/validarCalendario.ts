
import type {
  DataNormalizada,
  ResultadoValidacaoCalendario,
} from '../../types/validacao.types';

/**
 * Determina se um ano é bissexto
 * segundo o calendário gregoriano.
 */
function anoBissexto(ano: number): boolean {
  return (
    ano % 400 === 0 ||
    (ano % 4 === 0 && ano % 100 !== 0)
  );
}

/**
 * Retorna a quantidade de dias de um mês.
 * Deve ser chamada somente após validar
 * o intervalo do mês.
 */
function obterDiasDoMes(
  mes: number,
  ano: number
): number {
  const diasPorMes = [
    31,
    anoBissexto(ano) ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  return diasPorMes[mes - 1];
}

/**
 * RF-26 — Validação calendárica.
 *
 * Não altera, corrige ou normaliza a data.
 * Não verifica vencimento ou fabricação.
 */
export function validarCalendario(
  data: DataNormalizada
): ResultadoValidacaoCalendario {
  const { dia, mes, ano } = data;

  // 1. Verificar o mês.
  if (mes < 1 || mes > 12) {
    return {
      valida: false,
      data,
      motivo: 'MES_INVALIDO',
    };
  }

  // 2. Verificar o limite inferior do dia.
  if (dia < 1) {
    return {
      valida: false,
      data,
      motivo: 'DIA_INVALIDO',
    };
  }

  // 3. Verificar a existência do dia no mês.
  const limiteDias = obterDiasDoMes(mes, ano);

  if (dia > limiteDias) {
    return {
      valida: false,
      data,
      motivo: 'DIA_INEXISTENTE_NO_MES',
    };
  }

  return {
    valida: true,
    data,
  };
}
