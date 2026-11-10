
import { describe, expect, it, vi } from 'vitest';

import { normalizarData } from './normalizarData';

import * as calendarioModule from './validarCalendario';

describe('G4-05 — Integração RF-25 e RF-26', () => {

  it('INT-01: normaliza e valida uma data existente', () => {
    const resultado = normalizarData('21/10/2027');

    expect(resultado.sucesso).toBe(true);

    if (!resultado.sucesso) {
      throw new Error('Normalização deveria ter sucesso');
    }

    const calendario = calendarioModule.validarCalendario(
      resultado.valor
    );

    expect(calendario).toEqual({
      valida: true,
      data: resultado.valor,
    });

    expect(resultado.valor.data_iso).toBe('2027-10-21');
  });

  it('INT-02: normaliza uma data impossível e rejeita no calendário', () => {
    const resultado = normalizarData('31/02/2027');

    expect(resultado.sucesso).toBe(true);

    if (!resultado.sucesso) {
      throw new Error('Normalização deveria ter sucesso');
    }

    const calendario = calendarioModule.validarCalendario(
      resultado.valor
    );

    expect(calendario).toEqual({
      valida: false,
      data: resultado.valor,
      motivo: 'DIA_INEXISTENTE_NO_MES',
    });
  });

  it('INT-03: interrompe o fluxo para data incompleta', () => {
    const espiao = vi.spyOn(
      calendarioModule,
      'validarCalendario'
    );

    try {
      const resultado = normalizarData('21/10/');

      expect(resultado).toEqual({
        sucesso: false,
        data_original: '21/10/',
        motivo: 'DATA_INCOMPLETA',
      });

      if (resultado.sucesso) {
        calendarioModule.validarCalendario(resultado.valor);
      }

      expect(espiao).not.toHaveBeenCalled();
    } finally {
      espiao.mockRestore();
    }
  });

  it('INT-04: interrompe o fluxo para formato não suportado', () => {
    const espiao = vi.spyOn(
      calendarioModule,
      'validarCalendario'
    );

    try {
      const resultado = normalizarData('21/10.2027');

      expect(resultado).toEqual({
        sucesso: false,
        data_original: '21/10.2027',
        motivo: 'FORMATO_NAO_SUPORTADO',
      });

      if (resultado.sucesso) {
        calendarioModule.validarCalendario(resultado.valor);
      }

      expect(espiao).not.toHaveBeenCalled();
    } finally {
      espiao.mockRestore();
    }
  });

  it('INT-05: aceita uma data ISO bissexta válida', () => {
    const resultado = normalizarData('2028-02-29');

    expect(resultado.sucesso).toBe(true);

    if (!resultado.sucesso) {
      throw new Error('Normalização deveria ter sucesso');
    }

    const calendario = calendarioModule.validarCalendario(
      resultado.valor
    );

    expect(calendario.valida).toBe(true);
    expect(resultado.valor.data_iso).toBe('2028-02-29');
  });

  it('INT-06: preserva o texto original entre os módulos', () => {
    const entrada = ' 21/10/2027 ';

    const resultado = normalizarData(entrada);

    expect(resultado.sucesso).toBe(true);

    if (!resultado.sucesso) {
      throw new Error('Normalização deveria ter sucesso');
    }

    const calendario = calendarioModule.validarCalendario(
      resultado.valor
    );

    expect(calendario.data.data_original).toBe(entrada);
    expect(calendario.data).toBe(resultado.valor);
  });
});
