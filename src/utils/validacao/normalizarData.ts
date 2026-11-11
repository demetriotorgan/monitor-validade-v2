import type {
  DataNormalizada,
  ResultadoNormalizacao,
} from '../../types/validacao.types';


/**
 * DEC-G4-25 — Meses abreviados em português.
 *
 * Mapeamento determinístico.
 * Não realiza inferência contextual.
 */
const MESES_ABREVIADOS: Record<string, number> = {
  JAN: 1,
  FEV: 2,
  MAR: 3,
  ABR: 4,
  MAI: 5,
  JUN: 6,
  JUL: 7,
  AGO: 8,
  SET: 9,
  OUT: 10,
  NOV: 11,
  DEZ: 12,
};


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


  /**
   * DEC-G4-25 — Datas com mês textual incompletas.
   *
   * Exemplos:
   * 22 OUT
   * 22 OUT ?
   * 22 OUT 2?
   *
   * O mês precisa ser reconhecido.
   * Não completa componentes ausentes.
   */
  const estruturaTextualParcial =
    /^(\d{1,2}|\?{1,2})\s+([A-Za-z]{3})(?:\s+([0-9?]{0,4}))?$/;

  const correspondenciaTextual =
    texto.match(estruturaTextualParcial);

  if (correspondenciaTextual) {
    const [, diaTexto, mesTexto, anoTexto] =
      correspondenciaTextual;

    const mesReconhecido =
      MESES_ABREVIADOS[mesTexto.toUpperCase()];

    if (mesReconhecido !== undefined) {
      return (
        diaTexto.includes('?') ||
        anoTexto === undefined ||
        anoTexto.includes('?') ||
        (anoTexto.length !== 2 &&
          anoTexto.length !== 4)
      );
    }
  }

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
 *
 * DEC-G4-25:
 * Suporte adicional a meses abreviados
 * em português.
 *
 * Não executa validação calendárica.
 */
export function normalizarData(
  dataTexto: string
): ResultadoNormalizacao {
  const texto = dataTexto.trim();

  const formatoISO =
    /^(\d{4})-(\d{2})-(\d{2})$/;

  const formatoNacional =
    /^(\d{1,2})([./-])(\d{1,2})\2(\d{2}|\d{4})$/;

  const formatoTextual =
    /^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{2}|\d{4})$/;

  let dia: number;
  let mes: number;
  let ano: number;

  const correspondenciaISO =
    texto.match(formatoISO);

  if (correspondenciaISO) {
    ano = Number(correspondenciaISO[1]);
    mes = Number(correspondenciaISO[2]);
    dia = Number(correspondenciaISO[3]);

  } else {
    const correspondenciaNacional =
      texto.match(formatoNacional);

    if (correspondenciaNacional) {
      dia = Number(correspondenciaNacional[1]);
      mes = Number(correspondenciaNacional[3]);

      const anoTexto =
        correspondenciaNacional[4];

      ano =
        anoTexto.length === 2
          ? 2000 + Number(anoTexto)
          : Number(anoTexto);

    } else {
      const correspondenciaTextual =
        texto.match(formatoTextual);

      if (!correspondenciaTextual) {
        return {
          sucesso: false,
          data_original: dataTexto,
          motivo: possuiEstruturaIncompleta(texto)
            ? 'DATA_INCOMPLETA'
            : 'FORMATO_NAO_SUPORTADO',
        };
      }

      const mesTexto =
        correspondenciaTextual[2].toUpperCase();

      const mesReconhecido =
        MESES_ABREVIADOS[mesTexto];

      if (mesReconhecido === undefined) {
        return {
          sucesso: false,
          data_original: dataTexto,
          motivo: 'FORMATO_NAO_SUPORTADO',
        };
      }

      dia = Number(correspondenciaTextual[1]);
      mes = mesReconhecido;

      const anoTexto =
        correspondenciaTextual[3];

      ano =
        anoTexto.length === 2
          ? 2000 + Number(anoTexto)
          : Number(anoTexto);
    }
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
