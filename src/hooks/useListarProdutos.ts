// src/hooks/useListarProdutos.ts

import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { Produto } from '../types/produto.types';



export type Status = 'idle' | 'loading' | 'success' | 'error';

interface UseListarProdutosReturn {
  produtos: Produto[];
  status: Status;
  mensagem: string;
  recarregar: () => void;
}

export const useListarProdutos = (): UseListarProdutosReturn => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [mensagem, setMensagem] = useState('');
  const [contador, setContador] = useState(0);

  const recarregar = useCallback(() => {
    setContador((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const listarProdutos = async () => {
      setStatus('loading');
      setMensagem('');

      try {
        const response = await api.get('/listarProdutos');

        if (response.data?.sucesso && Array.isArray(response.data?.dados)) {
          setProdutos(response.data.dados);
          setStatus('success');
        } else {
          throw new Error('Resposta inesperada da API');
        }
      } catch (error) {
        setStatus('error');
        setMensagem(
          error instanceof Error
            ? error.message
            : 'Erro ao carregar produtos'
        );
      }
    };

    listarProdutos();
  }, [contador]);

  return {
    produtos,
    status,
    mensagem,
    recarregar,
  };
};
