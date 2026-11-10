
import { describe, expect, it } from 'vitest';

import { normalizarData } from './normalizarData';

describe('RF-25 — normalizarData', () => {
  const separadores = ['/', '.', '-'];

  const dias = ['1', '01'];
  const meses = ['2', '02'];
  const anos = ['27', '2027'];

  describe('Formatos nacionais autorizados', () => {
    for (const separador of separadores) {
      for (const dia of dias) {
        for (const mes of meses) {
          for (const ano of anos) {
            const entrada =
              `${dia}${separador}${mes}${separador}${ano}`;

            it(`normaliza ${entrada}`, () => {
              const resultado = normalizarData(entrada);

              expect(resultado.sucesso).toBe(true);

              if (!resultado.sucesso) {
                throw new Error(
                  `Falha inesperada: ${entrada}`
                );
              }

              expect(resultado.valor).toEqual({
                data_original: entrada,
                dia: 1,
                mes: 2,
                ano: 2027,
                data_iso: '2027-02-01',
              });
            });
          }
        }
      }
    }
  });

  describe('Formato ISO explícito', () => {
    it('normaliza AAAA-MM-DD', () => {
      const resultado = normalizarData('2027-10-21');

      expect(resultado).toEqual({
        sucesso: true,
        valor: {
          data_original: '2027-10-21',
          dia: 21,
          mes: 10,
          ano: 2027,
          data_iso: '2027-10-21',
        },
      });
    });
  });

  describe('Preservação do texto original', () => {
    it('ignora espaços externos na interpretação', () => {
      const entrada = ' 21/10/2027 ';

      const resultado = normalizarData(entrada);

      expect(resultado).toEqual({
        sucesso: true,
        valor: {
          data_original: entrada,
          dia: 21,
          mes: 10,
          ano: 2027,
          data_iso: '2027-10-21',
        },
      });
    });
  });

  describe('Conversão de anos curtos', () => {
    const casos = [
      ['01/02/00', '2000-02-01', 2000],
      ['01/02/25', '2025-02-01', 2025],
      ['01/02/99', '2099-02-01', 2099],
    ] as const;

    it.each(casos)(
      'normaliza %s para %s',
      (entrada, isoEsperado, anoEsperado) => {
        const resultado = normalizarData(entrada);

        expect(resultado.sucesso).toBe(true);

        if (!resultado.sucesso) {
          throw new Error(
            `Falha inesperada: ${entrada}`
          );
        }

        expect(resultado.valor.data_iso)
          .toBe(isoEsperado);

        expect(resultado.valor.ano)
          .toBe(anoEsperado);
      }
    );
  });

  describe('Separação entre RF-25 e RF-26', () => {
    it('normaliza uma data impossível no calendário', () => {
      const resultado = normalizarData('31/02/2027');

      expect(resultado).toEqual({
        sucesso: true,
        valor: {
          data_original: '31/02/2027',
          dia: 31,
          mes: 2,
          ano: 2027,
          data_iso: '2027-02-31',
        },
      });
    });
  });

describe('Classificação de falhas estruturais', () => {
  const casosIncompletos = [
    '',
    '   ',
    '21/10',
    '21/10/',
    '/10/2027',
    '21//2027',
    '21/10/2',
    '21/10/202',
    '21/10/20?7',
    '2?/10/2027',
  ];

  it.each(casosIncompletos)(
    'classifica "%s" como DATA_INCOMPLETA',
    (entrada) => {
      const resultado = normalizarData(entrada);

      expect(resultado).toEqual({
        sucesso: false,
        data_original: entrada,
        motivo: 'DATA_INCOMPLETA',
      });
    }
  );

  const casosNaoSuportados = [
    '21/10.2027',
    '21 /10/2027',
    'VAL 21/10/2027',
    '21/10/2027abc',
    '21/10/20277',
    '21/10/2027?',
    'abc',
  ];

  it.each(casosNaoSuportados)(
    'classifica "%s" como FORMATO_NAO_SUPORTADO',
    (entrada) => {
      const resultado = normalizarData(entrada);

      expect(resultado).toEqual({
        sucesso: false,
        data_original: entrada,
        motivo: 'FORMATO_NAO_SUPORTADO',
      });
    }
  );
});


describe('G4-03.4 — Casos-limite', () => {
  const casosIncompletos = [
    '2027-10-',
    '2027-10',
    '2027--21',
    '2027-10-2?',
    '21/10/202?',
  ];

  it.each(casosIncompletos)(
    'classifica "%s" como DATA_INCOMPLETA',
    (entrada) => {
      expect(normalizarData(entrada)).toEqual({
        sucesso: false,
        data_original: entrada,
        motivo: 'DATA_INCOMPLETA',
      });
    }
  );

  const casosNaoSuportados = [
    '21/1?0/2027',
    '21/10/2027?',
    '21/10/20277',
    '2027/10/21',
  ];

  it.each(casosNaoSuportados)(
    'classifica "%s" como FORMATO_NAO_SUPORTADO',
    (entrada) => {
      expect(normalizarData(entrada)).toEqual({
        sucesso: false,
        data_original: entrada,
        motivo: 'FORMATO_NAO_SUPORTADO',
      });
    }
  );
});


describe('G4-03.4 — Casos-limite', () => {
  const casosIncompletos = [
    '2027-10-',
    '2027-10',
    '2027--21',
    '2027-10-2?',
    '202?-10-21',
    '21/10/202?',
  ];

  it.each(casosIncompletos)(
    'classifica "%s" como DATA_INCOMPLETA',
    (entrada) => {
      expect(normalizarData(entrada)).toEqual({
        sucesso: false,
        data_original: entrada,
        motivo: 'DATA_INCOMPLETA',
      });
    }
  );

  const casosNaoSuportados = [
    '21/1?0/2027',
    '21/10/2027?',
    '21/10/20277',
    '2027/10/21',
    '2027-10-21abc',
    '2027/10-21',
  ];

  it.each(casosNaoSuportados)(
    'classifica "%s" como FORMATO_NAO_SUPORTADO',
    (entrada) => {
      expect(normalizarData(entrada)).toEqual({
        sucesso: false,
        data_original: entrada,
        motivo: 'FORMATO_NAO_SUPORTADO',
      });
    }
  );
});

});
