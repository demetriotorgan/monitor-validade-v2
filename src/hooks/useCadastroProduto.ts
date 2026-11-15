// src/hooks/useCadastroProduto.ts

import { useState, type FormEvent, type ChangeEvent } from 'react';
import api from '../services/api';
import axios from 'axios';

interface ProdutoFormData {
  codigoBarras: string;
  nome: string;
}

interface UsecadastroProdutoOptions{
  onSucesso?: ()=>void;
}

const INITIAL_FORM: ProdutoFormData = {
  codigoBarras: '',
  nome: '',
};

type Status = 'idle' | 'loading' | 'success' | 'error';

export const useCadastroProduto = (options?:UsecadastroProdutoOptions) => {
  const [formData, setFormData] = useState<ProdutoFormData>(INITIAL_FORM);
  const [erros, setErros] = useState<Partial<ProdutoFormData>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [mensagem, setMensagem] = useState('');
  const [modalAberto, setModalAberto] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErros((prev) => ({ ...prev, [name]: '' }));
  };

  const validar = (): boolean => {
    const novosErros: Partial<ProdutoFormData> = {};

    if (!formData.codigoBarras.trim()) {
      novosErros.codigoBarras = 'O código de barras é obrigatório';
    }

    if (!formData.nome.trim()) {
      novosErros.nome = 'O nome do produto é obrigatório';
    } else if (formData.nome.length > 255) {
      novosErros.nome = 'O nome deve ter no máximo 255 caracteres';
    }

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setMensagem('');
    setStatus('idle');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validar()) return;

    const confirmar = window.confirm('Deseja realmente cadastrar esse produto?');
    if (!confirmar) return;

    setStatus('loading');
    setMensagem('');

    try {
      await api.post('/salvarProduto', formData);

      setStatus('success');
      setMensagem('Produto cadastrado com sucesso!');
      setModalAberto(true);
      resetForm();
      options?.onSucesso?.();
    } catch (error) {
      setStatus('error');

      if (axios.isAxiosError(error)) {
        setMensagem(
          error.response?.data?.message ||
          error.response?.data?.erro ||
          'Erro ao cadastrar produto'
        );
      } else {
        setMensagem(error instanceof Error ? error.message : 'Erro inesperado');
      }

      setModalAberto(true);
    }
  };

  return {
    formData,
    erros,
    status,
    mensagem,
    modalAberto,
    handleChange,
    handleSubmit,
    fecharModal,
  };
};
