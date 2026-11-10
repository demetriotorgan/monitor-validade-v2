
import { describe, expect, it } from 'vitest';

import type {
  DataNormalizada,
} from '../../types/validacao.types';

import { validarCalendario } from './validarCalendario';

function criarData(
  dia: number,
  mes: number,
  ano: number
): DataNormalizada {
  return {
    data_original: `${dia}/${mes}/${ano}`,
    dia,
    mes,
    ano,
    data_iso: [
      String(ano).padStart(4, '0'),
      String(mes).padStart(2, '0'),
      String(dia).padStart(2, '0'),
    ].join('-'),
  };
}

describe('RF-26 — validarCalendario', () => {
  describe('Datas válidas', () => {
    const casos = [
      [1, 1, 2027],
      [21, 10, 2027],
      [31, 1, 2027],
      [30, 4, 2027],
      [28, 2, 2027],
      [31, 12, 2027],
    ] as const;

    it.each(casos)(
      'aceita %i/%i/%i',
      (dia, mes, ano) => {
        const data = criarData(dia, mes, ano);
        expect(validarCalendario(data)).toEqual({
          valida: true,
          data,
        });
      }
    );
  });

  describe('Meses inválidos', () => {
    it.each([0, 13, 15])(
      'rejeita mês %i',
      (mes) => {
        const data = criarData(10, mes, 2027);

        expect(validarCalendario(data)).toEqual({
          valida: false,
          data,
          motivo: 'MES_INVALIDO',
        });
      }
    );
  });

  describe('Dias inválidos', () => {
    it('rejeita dia zero', () => {
      const data = criarData(0, 10, 2027);

      expect(validarCalendario(data)).toEqual({
        valida: false,
        data,
        motivo: 'DIA_INVALIDO',
      });
    });

    it('rejeita dia negativo', () => {
      const data = criarData(-1, 10, 2027);

      expect(validarCalendario(data)).toEqual({
        valida: false,
        data,
        motivo: 'DIA_INVALIDO',
      });
    });
  });

  describe('Dias inexistentes no mês', () => {
    const casos = [
      [31, 4, 2027],
      [31, 6, 2027],
      [31, 9, 2027],
      [31, 11, 2027],
      [32, 1, 2027],
      [29, 2, 2027],
      [30, 2, 2028],
    ] as const;

    it.each(casos)(
      'rejeita %i/%i/%i',
      (dia, mes, ano) => {
        const data = criarData(dia, mes, ano);

        expect(validarCalendario(data)).toEqual({
          valida: false,
          data,
          motivo: 'DIA_INEXISTENTE_NO_MES',
        });
      }
    );
  });

  describe('Anos bissextos', () => {
    it.each([2000, 2024, 2028, 2400])(
      'aceita 29/02/%i',
      (ano) => {
        const data = criarData(29, 2, ano);

        expect(validarCalendario(data)).toEqual({
          valida: true,
          data,
        });
      }
    );

    it.each([1900, 2025, 2027, 2100])(
      'rejeita 29/02/%i',
      (ano) => {
        const data = criarData(29, 2, ano);

        expect(validarCalendario(data)).toEqual({
          valida: false,
          data,
          motivo: 'DIA_INEXISTENTE_NO_MES',
        });
      }
    );
  });

  describe('Preservação dos dados', () => {
    it('não altera o objeto recebido', () => {
      const data = criarData(31, 2, 2027);
      const copia = { ...data };

      const resultado = validarCalendario(data);

      expect(data).toEqual(copia);
      expect(resultado.data).toBe(data);
    });
  });
});
