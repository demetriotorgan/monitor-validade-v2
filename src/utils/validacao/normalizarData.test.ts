
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


describe('DEC-G4-25 — Meses textuais', () => {
  it.each([
    ['22 OUT 26', 22, 10, 2026, '2026-10-22'],
    ['15 NOV 2026', 15, 11, 2026, '2026-11-15'],
    ['03 DEZ 27', 3, 12, 2027, '2027-12-03'],
    ['22 out 26', 22, 10, 2026, '2026-10-22'],
    ['01 JAN 25', 1, 1, 2025, '2025-01-01'],
    ['28 FEV 26', 28, 2, 2026, '2026-02-28'],
    ['15 MAR 27', 15, 3, 2027, '2027-03-15'],
    ['10 ABR 28', 10, 4, 2028, '2028-04-10'],
    ['05 MAI 29', 5, 5, 2029, '2029-05-05'],
    ['12 JUN 30', 12, 6, 2030, '2030-06-12'],
    ['18 JUL 31', 18, 7, 2031, '2031-07-18'],
    ['20 AGO 32', 20, 8, 2032, '2032-08-20'],
    ['25 SET 33', 25, 9, 2033, '2033-09-25'],
  ])(
    'normaliza %s',
    (entrada, dia, mes, ano, dataISO) => {
      const resultado = normalizarData(entrada);

      expect(resultado.sucesso).toBe(true);

      if (!resultado.sucesso) return;

      expect(resultado.valor).toEqual({
        data_original: entrada,
        dia,
        mes,
        ano,
        data_iso: dataISO,
      });
    },
  );

  it('rejeita mês textual desconhecido', () => {
    expect(normalizarData('22 XYZ 26')).toEqual({
      sucesso: false,
      data_original: '22 XYZ 26',
      motivo: 'FORMATO_NAO_SUPORTADO',
    });
  });

  it('identifica ano ausente', () => {
    expect(normalizarData('22 OUT')).toEqual({
      sucesso: false,
      data_original: '22 OUT',
      motivo: 'DATA_INCOMPLETA',
    });
  });

  it('identifica ano parcialmente ilegível', () => {
    expect(normalizarData('22 OUT 2?')).toEqual({
      sucesso: false,
      data_original: '22 OUT 2?',
      motivo: 'DATA_INCOMPLETA',
    });
  });

  it('não valida calendário no RF-25', () => {
    const resultado = normalizarData('31 FEV 26');

    expect(resultado.sucesso).toBe(true);

    if (!resultado.sucesso) return;

    expect(resultado.valor.data_iso).toBe(
      '2026-02-31',
    );
  });
});


});
