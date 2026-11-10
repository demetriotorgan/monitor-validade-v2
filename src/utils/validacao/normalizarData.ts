
import type {
  DataNormalizada,
  ResultadoNormalizacao,
} from '../../types/validacao.types';




/**
 * DEC-G4-07 e DEC-G4-09
 *
 * Identifica datas estruturalmente incompletas.
 * Não corrige, completa ou infere componentes.
 */
function possuiEstruturaIncompleta(
  texto: string
): boolean {
  // Entrada vazia ou composta apenas por espaços.
  // O trim() já é realizado pela função principal.
  if (texto === '') {
    return true;
  }

  /**
   * 1. Estruturas ISO parciais.
   *
   * Ordem obrigatória: AAAA-MM-DD.
   * Separador obrigatório: hífen.
   *
   * Permite ausência de componentes e
   * caracteres ilegíveis (?) nas posições esperadas.
   */
  const estruturaISOParcial =
    /^([0-9?]{4})-([0-9?]{0,2})(?:-([0-9?]{0,2}))?$/;

  if (estruturaISOParcial.test(texto)) {
    return true;
  }

  /**
   * 2. Estruturas nacionais parciais.
   *
   * Ordem: D/M/AA ou D/M/AAAA.
   * Separadores: / . -
   * O segundo separador, quando presente,
   * deve ser igual ao primeiro.
   */
  const estruturaNacional =
    /^([^./-]*)([./-])([^./-]*)(?:\2([^./-]*))?$/;

  const correspondencia =
    texto.match(estruturaNacional);

  if (!correspondencia) {
    return false;
  }

  const [, dia, , mes, ano] =
    correspondencia;

  const componentePossivel = /^[0-9?]*$/;

  // Não aceita letras, espaços internos
  // ou outros caracteres inesperados.
  if (
    !componentePossivel.test(dia) ||
    !componentePossivel.test(mes) ||
    (
      ano !== undefined &&
      !componentePossivel.test(ano)
    )
  ) {
    return false;
  }

  // Rejeita componentes excedentes.
  if (dia.length > 2 || mes.length > 2) {
    return false;
  }

  if (ano !== undefined && ano.length > 4) {
    return false;
  }

  // Caracteres ilegíveis em posições esperadas.
  if (
    dia.includes('?') ||
    mes.includes('?') ||
    ano?.includes('?')
  ) {
    return true;
  }

  // Componentes ausentes.
  if (
    dia.length === 0 ||
    mes.length === 0 ||
    ano === undefined ||
    ano.length === 0
  ) {
    return true;
  }

  // Ano com largura insuficiente.
  return ano.length !== 2 &&
    ano.length !== 4;
}


/**
 * RF-25 — Normalização estrutural.
 */
export function normalizarData(
  dataTexto: string
): ResultadoNormalizacao {
  const texto = dataTexto.trim();

  const formatoISO = /^(\d{4})-(\d{2})-(\d{2})$/;

  const formatoNacional =
    /^(\d{1,2})([./-])(\d{1,2})\2(\d{2}|\d{4})$/;

  let dia: number;
  let mes: number;
  let ano: number;

  const correspondenciaISO = texto.match(formatoISO);

  if (correspondenciaISO) {
    ano = Number(correspondenciaISO[1]);
    mes = Number(correspondenciaISO[2]);
    dia = Number(correspondenciaISO[3]);
  } else {
    const correspondenciaNacional =
      texto.match(formatoNacional);

    if (!correspondenciaNacional) {
      return {
        sucesso: false,
        data_original: dataTexto,
        motivo: possuiEstruturaIncompleta(texto)
          ? 'DATA_INCOMPLETA'
          : 'FORMATO_NAO_SUPORTADO',
      };
    }

    dia = Number(correspondenciaNacional[1]);
    mes = Number(correspondenciaNacional[3]);

    const anoTexto = correspondenciaNacional[4];

    ano =
      anoTexto.length === 2
        ? 2000 + Number(anoTexto)
        : Number(anoTexto);
  }

  const dataISO = [
    String(ano).padStart(4, '0'),
    String(mes).padStart(2, '0'),
    String(dia).padStart(2, '0'),
  ].join('-');

  const valor: DataNormalizada = {
    data_original: dataTexto,
    dia,
    mes,
    ano,
    data_iso: dataISO,
  };

  return {
    sucesso: true,
    valor,
  };
}
