
import { describe, expect, it } from 'vitest';

import { normalizarData } from './normalizarData';
import { avaliarDataIncompleta } from './avaliarDataIncompleta';

describe('RF29-05 — Integração RF-25 e RF-29', () => {

  it('permite continuar quando a data está completa', () => {
    const normalizacao = normalizarData('21/10/2027');

    expect(normalizacao.sucesso).toBe(true);

    const avaliacao = avaliarDataIncompleta(normalizacao);

    expect(avaliacao).toBeNull();
  });

  it('identifica ano ausente após normalização', () => {
    const normalizacao = normalizarData('21/10/');

    expect(normalizacao).toMatchObject({
      sucesso: false,
      motivo: 'DATA_INCOMPLETA',
    });

    const avaliacao = avaliarDataIncompleta(normalizacao);

    expect(avaliacao).toMatchObject({
      aceita: false,
      motivo: 'ANO_AUSENTE',
      requer_correcao_manual: true,
    });
  });

  it('identifica mês ausente após normalização', () => {
    const normalizacao = normalizarData('21//2027');

    expect(normalizacao).toMatchObject({
      sucesso: false,
      motivo: 'DATA_INCOMPLETA',
    });

    const avaliacao = avaliarDataIncompleta(normalizacao);

    expect(avaliacao?.motivo).toBe('MES_AUSENTE');
  });

  it('identifica componente ilegível após normalização', () => {
    const normalizacao = normalizarData('21/10/20?7');

    expect(normalizacao).toMatchObject({
      sucesso: false,
      motivo: 'DATA_INCOMPLETA',
    });

    const avaliacao = avaliarDataIncompleta(normalizacao);

    expect(avaliacao?.motivo).toBe(
      'COMPONENTE_ILEGIVEL'
    );
  });

  it('preserva responsabilidade do RF-25 sobre formato não suportado', () => {
    const normalizacao = normalizarData('21/10.2027');

    expect(normalizacao).toMatchObject({
      sucesso: false,
      motivo: 'FORMATO_NAO_SUPORTADO',
    });

    const avaliacao = avaliarDataIncompleta(normalizacao);

    expect(avaliacao).toBeNull();
  });

  it('identifica ambiguidade explícita mesmo após normalização bem-sucedida', () => {
    const normalizacao = normalizarData('21/10/2027');

    expect(normalizacao.sucesso).toBe(true);

    const avaliacao = avaliarDataIncompleta(
      normalizacao,
      { interpretacaoAmbigua: true }
    );

    expect(avaliacao).toMatchObject({
      aceita: false,
      motivo: 'INTERPRETACAO_AMBIGUA',
      requer_correcao_manual: true,
    });
  });

  it('não confunde data calendariamente inválida com data incompleta', () => {
    const normalizacao = normalizarData('31/02/2027');

    expect(normalizacao.sucesso).toBe(true);

    const avaliacao = avaliarDataIncompleta(normalizacao);

    expect(avaliacao).toBeNull();
  });

  it('preserva a entrada original ao solicitar correção', () => {
    const entrada = ' 21/10/ ';

    const normalizacao = normalizarData(entrada);

    const avaliacao = avaliarDataIncompleta(normalizacao);

    expect(avaliacao).toMatchObject({
      data_original: entrada,
      motivo: 'ANO_AUSENTE',
      requer_correcao_manual: true,
    });
  });

  it('não modifica o resultado de normalização', () => {
    const normalizacao = normalizarData('21/10/20?7');

    const copia = structuredClone(normalizacao);

    avaliarDataIncompleta(normalizacao);

    expect(normalizacao).toEqual(copia);
  });
});
