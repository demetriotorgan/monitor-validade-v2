
import type {
  ContextoAvaliacaoRF29,
  MotivoRejeicaoRF29,
  ResultadoNormalizacao,
  ResultadoRejeicaoRF29,
} from '../../types/validacao.types';

/**
 * RF-29 — Identifica componentes ausentes
 * ou ilegíveis em datas classificadas como
 * incompletas pelo RF-25.
 */
function identificarProblemaEstrutural(
  dataTexto: string
): MotivoRejeicaoRF29 {
  const texto = dataTexto.trim();

  if (texto === '') {
    return 'COMPONENTES_INSUFICIENTES';
  }

  // Estrutura ISO parcial: AAAA-MM-DD
  const isoParcial =
    /^([0-9?]{4})-([0-9?]{0,2})(?:-([0-9?]{0,2}))?$/;

  const correspondenciaISO = texto.match(isoParcial);

  if (correspondenciaISO) {
    const ano = correspondenciaISO[1];
    const mes = correspondenciaISO[2];
    const dia = correspondenciaISO[3];

    // Ilegibilidade explícita
    if (
      ano.includes('?') ||
      mes.includes('?') ||
      dia?.includes('?')
    ) {
      return 'COMPONENTE_ILEGIVEL';
    }

    if (mes === '') {
      return 'MES_AUSENTE';
    }

    if (dia === undefined || dia === '') {
      return 'DIA_AUSENTE';
    }

    return 'COMPONENTES_INSUFICIENTES';
  }

  // Estrutura nacional parcial: DD/MM/AAAA
  // Separadores uniformes: / . -
  const nacionalParcial =
    /^([^./-]*)([./-])([^./-]*)(?:\2([^./-]*))?$/;

  const correspondenciaNacional =
    texto.match(nacionalParcial);

  if (!correspondenciaNacional) {
    return 'COMPONENTES_INSUFICIENTES';
  }

  const dia = correspondenciaNacional[1];
  const mes = correspondenciaNacional[3];
  const ano = correspondenciaNacional[4];

  // Ilegibilidade tem precedência
  // sobre componentes ausentes.
  if (
    dia.includes('?') ||
    mes.includes('?') ||
    ano?.includes('?')
  ) {
    return 'COMPONENTE_ILEGIVEL';
  }

  const ausentes = [
    dia === '',
    mes === '',
    ano === undefined || ano === '',
  ];

  const quantidadeAusentes =
    ausentes.filter(Boolean).length;

  if (quantidadeAusentes > 1) {
    return 'COMPONENTES_INSUFICIENTES';
  }

  if (dia === '') {
    return 'DIA_AUSENTE';
  }

  if (mes === '') {
    return 'MES_AUSENTE';
  }

  if (ano === undefined || ano === '') {
    return 'ANO_AUSENTE';
  }

  return 'COMPONENTES_INSUFICIENTES';
}

/**
 * RF-29 — Avaliação complementar ao RF-25.
 *
 * DEC-G4-11:
 * Classificação determinística com
 * sinalização explícita de ambiguidade.
 *
 * DEC-G4-12:
 * Recebe ResultadoNormalizacao.
 *
 * DEC-G4-13:
 * Ambiguidade explícita possui precedência.
 */
export function avaliarDataIncompleta(
  resultadoNormalizacao: ResultadoNormalizacao,
  contexto?: ContextoAvaliacaoRF29
): ResultadoRejeicaoRF29 | null {

  // Preserva a entrada textual original.
  const dataOriginal = resultadoNormalizacao.sucesso
    ? resultadoNormalizacao.valor.data_original
    : resultadoNormalizacao.data_original;

  // Prioridade 1 — Ambiguidade explícita
  if (contexto?.interpretacaoAmbigua === true) {
    return {
      aceita: false,
      data_original: dataOriginal,
      motivo: 'INTERPRETACAO_AMBIGUA',
      requer_correcao_manual: true,
    };
  }

  // Normalização bem-sucedida
  // e ausência de ambiguidade.
  if (resultadoNormalizacao.sucesso) {
    return null;
  }

  // Formatos não suportados permanecem
  // sob responsabilidade do RF-25.
  if (
    resultadoNormalizacao.motivo !==
    'DATA_INCOMPLETA'
  ) {
    return null;
  }

  // Prioridades 3 e 4:
  // ilegibilidade e componentes ausentes.
  const motivo = identificarProblemaEstrutural(
    resultadoNormalizacao.data_original
  );

  return {
    aceita: false,
    data_original: dataOriginal,
    motivo,
    requer_correcao_manual: true,
  };
}
