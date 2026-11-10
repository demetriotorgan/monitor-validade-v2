
import { describe, expect, it } from 'vitest';

import { normalizarData } from './normalizarData';

import { avaliarDataIncompleta } from './avaliarDataIncompleta';

describe('RF29-02 — Componentes ausentes', () => {
  const casos = [
    ['21/10/', 'ANO_AUSENTE'],
    ['21/10', 'ANO_AUSENTE'],
    ['/10/2027', 'DIA_AUSENTE'],
    ['21//2027', 'MES_AUSENTE'],
    ['2027-10-', 'DIA_AUSENTE'],
    ['2027-10', 'DIA_AUSENTE'],
    ['2027--21', 'MES_AUSENTE'],
    ['', 'COMPONENTES_INSUFICIENTES'],
    ['   ', 'COMPONENTES_INSUFICIENTES'],
    ['//', 'COMPONENTES_INSUFICIENTES'],
    ['21//', 'COMPONENTES_INSUFICIENTES'],
  ] as const;

  it.each(casos)(
    'classifica %s como %s',
    (entrada, motivoEsperado) => {
      const normalizacao = normalizarData(entrada);

      expect(normalizacao.sucesso).toBe(false);

      const resultado =
        avaliarDataIncompleta(normalizacao);

      expect(resultado).toEqual({
        aceita: false,
        data_original: entrada,
        motivo: motivoEsperado,
        requer_correcao_manual: true,
      });
    }
  );

  it('não rejeita uma data normalizada com sucesso', () => {
    const normalizacao =
      normalizarData('21/10/2027');

    expect(
      avaliarDataIncompleta(normalizacao)
    ).toBeNull();
  });

  it('não assume responsabilidade por formato não suportado', () => {
    const normalizacao =
      normalizarData('21/10.2027');

    expect(
      avaliarDataIncompleta(normalizacao)
    ).toBeNull();
  });

  it('preserva o texto original com espaços externos', () => {
    const entrada = ' 21/10/ ';

    const resultado = avaliarDataIncompleta(
      normalizarData(entrada)
    );

    expect(resultado?.data_original).toBe(entrada);
    expect(resultado?.motivo).toBe('ANO_AUSENTE');
  });
  
});


describe('RF29-03 — Ilegibilidade e ambiguidade', () => {

  const casosIlegiveis = [
    '21/10/20?7',
    '202?-10-21',
    '2?/10/2027',
    '21/1?/2027',
    '??/10/2027',
    '2027-1?-21',
  ] as const;

  it.each(casosIlegiveis)(
    'classifica %s como componente ilegível',
    (entrada) => {
      const normalizacao = normalizarData(entrada);

      expect(normalizacao.sucesso).toBe(false);

      const resultado = avaliarDataIncompleta(
        normalizacao
      );

      expect(resultado).toEqual({
        aceita: false,
        data_original: entrada,
        motivo: 'COMPONENTE_ILEGIVEL',
        requer_correcao_manual: true,
      });
    }
  );

  it('não confunde ano parcial com caractere ilegível', () => {
    const resultado = avaliarDataIncompleta(
      normalizarData('21/10/2')
    );

    expect(resultado?.motivo).toBe(
      'COMPONENTES_INSUFICIENTES'
    );
  });

  it('reconhece ambiguidade explícita em data completa', () => {
    const resultado = avaliarDataIncompleta(
      normalizarData('21/10/2027'),
      { interpretacaoAmbigua: true }
    );

    expect(resultado).toEqual({
      aceita: false,
      data_original: '21/10/2027',
      motivo: 'INTERPRETACAO_AMBIGUA',
      requer_correcao_manual: true,
    });
  });

  it('prioriza ambiguidade sobre ilegibilidade', () => {
    const resultado = avaliarDataIncompleta(
      normalizarData('21/10/20?7'),
      { interpretacaoAmbigua: true }
    );

    expect(resultado?.motivo).toBe(
      'INTERPRETACAO_AMBIGUA'
    );
  });

  it('prioriza ambiguidade sobre formato não suportado', () => {
    const normalizacao = normalizarData(
      '21/10.2027'
    );

    expect(normalizacao.sucesso).toBe(false);

    const resultado = avaliarDataIncompleta(
      normalizacao,
      { interpretacaoAmbigua: true }
    );

    expect(resultado?.motivo).toBe(
      'INTERPRETACAO_AMBIGUA'
    );

    if (!normalizacao.sucesso) {
      expect(normalizacao.motivo).toBe(
        'FORMATO_NAO_SUPORTADO'
      );
    }
  });

  it('preserva ausência de rejeição quando não há ambiguidade', () => {
    const resultado = avaliarDataIncompleta(
      normalizarData('21/10/2027'),
      { interpretacaoAmbigua: false }
    );

    expect(resultado).toBeNull();
  });

  it('preserva texto original em rejeição por ambiguidade', () => {
    const entrada = ' 21/10/2027 ';

    const resultado = avaliarDataIncompleta(
      normalizarData(entrada),
      { interpretacaoAmbigua: true }
    );

    expect(resultado?.data_original).toBe(entrada);
  });

  it('mantém a classificação de ausência sem ambiguidade', () => {
    const resultado = avaliarDataIncompleta(
      normalizarData('21/10/'),
      { interpretacaoAmbigua: false }
    );

    expect(resultado?.motivo).toBe('ANO_AUSENTE');
  });

  it('não modifica o resultado original do RF-25', () => {
    const normalizacao = normalizarData(
      '21/10/20?7'
    );

    const copia = structuredClone(normalizacao);

    avaliarDataIncompleta(
      normalizacao,
      { interpretacaoAmbigua: true }
    );

    expect(normalizacao).toEqual(copia);
  });
});


describe('RF29-04 — Casos-limite e regressão', () => {

  const casosMistos = [
    '21//20?7',
    '2027--2?',
    '2?//2027',
  ] as const;

  it.each(casosMistos)(
    'prioriza ilegibilidade sobre ausência em %s',
    (entrada) => {
      const normalizacao = normalizarData(entrada);

      expect(normalizacao).toMatchObject({
        sucesso: false,
        motivo: 'DATA_INCOMPLETA',
      });

      const resultado = avaliarDataIncompleta(
        normalizacao
      );

      expect(resultado).toEqual({
        aceita: false,
        data_original: entrada,
        motivo: 'COMPONENTE_ILEGIVEL',
        requer_correcao_manual: true,
      });
    }
  );

  it('não classifica formato não suportado como incompleto', () => {
    const normalizacao = normalizarData(
      '21/10/2027?'
    );

    expect(normalizacao).toMatchObject({
      sucesso: false,
      motivo: 'FORMATO_NAO_SUPORTADO',
    });

    expect(
      avaliarDataIncompleta(normalizacao)
    ).toBeNull();
  });

  it('prioriza ambiguidade explícita sobre formato não suportado', () => {
    const entrada = '21/10/2027?';

    const normalizacao = normalizarData(entrada);

    expect(normalizacao).toMatchObject({
      sucesso: false,
      motivo: 'FORMATO_NAO_SUPORTADO',
    });

    const resultado = avaliarDataIncompleta(
      normalizacao,
      { interpretacaoAmbigua: true }
    );

    expect(resultado).toEqual({
      aceita: false,
      data_original: entrada,
      motivo: 'INTERPRETACAO_AMBIGUA',
      requer_correcao_manual: true,
    });
  });

  it('prioriza ambiguidade explícita sobre ilegibilidade e ausência', () => {
    const resultado = avaliarDataIncompleta(
      normalizarData('21//20?7'),
      { interpretacaoAmbigua: true }
    );

    expect(resultado?.motivo).toBe(
      'INTERPRETACAO_AMBIGUA'
    );
  });

  it('preserva classificação de ano ausente', () => {
    const resultado = avaliarDataIncompleta(
      normalizarData('21/10/')
    );

    expect(resultado?.motivo).toBe('ANO_AUSENTE');
  });

  it('não rejeita data completa sem ambiguidade', () => {
    const resultado = avaliarDataIncompleta(
      normalizarData('21/10/2027')
    );

    expect(resultado).toBeNull();
  });

  it('não altera o resultado de normalização em caso misto', () => {
    const normalizacao = normalizarData(
      '21//20?7'
    );

    const copia = structuredClone(normalizacao);

    avaliarDataIncompleta(normalizacao);

    expect(normalizacao).toEqual(copia);
  });
});
