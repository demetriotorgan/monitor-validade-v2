// src/hooks/useBuscarProdutos.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../services/api';
import axios from 'axios';

export interface ProdutoBuscado {
  _id: string;
  codigoBarras: string;
  nome: string;
  criadoEm: string;
  atualizadoEm: string;
}

interface BuscarProdutosResponse {
  sucesso: boolean;
  dados: ProdutoBuscado[];
}

export type StatusBusca = 'idle' | 'loading' | 'success' | 'error';

interface UseBuscarProdutosReturn {
  termo: string;
  setTermo: (termo: string) => void;
  produtos: ProdutoBuscado[];
  status: StatusBusca;
  mensagem: string;
}

const DEBOUNCE_MS = 400;

export const useBuscarProdutos = (): UseBuscarProdutosReturn => {
  const [termo, setTermo] = useState('');
  const [produtos, setProdutos] = useState<ProdutoBuscado[]>([]);
  const [status, setStatus] = useState<StatusBusca>('idle');
  const [mensagem, setMensagem] = useState('');

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buscar = useCallback(async (busca: string) => {
    if (!busca.trim()) {
      setProdutos([]);
      setStatus('idle');
      setMensagem('');
      return;
    }

    const controller = new AbortController();

    setStatus('loading');
    setMensagem('');

    try {
      const response = await api.get<BuscarProdutosResponse>('/buscar', {
        params: { busca },
        signal: controller.signal,
      });

      setProdutos(response.data.dados);
      setStatus('success');
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }

      setStatus('error');
      setProdutos([]);

      if (axios.isAxiosError(error)) {
        setMensagem(
          error.response?.data?.erro ||
          error.response?.data?.message ||
          'Erro ao buscar produtos'
        );
      } else {
        setMensagem(error instanceof Error ? error.message : 'Erro inesperado');
      }
    }

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      buscar(termo);
    }, DEBOUNCE_MS);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [termo, buscar]);

  return {
    termo,
    setTermo,
    produtos,
    status,
    mensagem,
  };
};
