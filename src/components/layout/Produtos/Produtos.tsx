// src/pages/Produtos/Produtos.tsx

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { PackagePlus } from 'lucide-react';
import './Produtos.css';
import api from '../../../services/api';
import axios from 'axios';
import Spinner from '../Spinner/Spinner';
import Resultado from '../Mensagem/Resultado';

interface ProdutoFormData {
  codigoBarras: string;
  nome: string;
}

const form = {
  codigoBarras: '',
  nome: ''
}

const Produtos = () => {
  const [formData, setFormData] = useState<ProdutoFormData>(form);

  const [erros, setErros] = useState<Partial<ProdutoFormData>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
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

  const fecharModal = ()=>{
    setModalAberto(false);
    setMensagem('');
    setStatus('idle');
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    //1. Validando formulario
    if (!validar()) return;

    //2. Confirmando registro
    const confirmar = window.confirm("Deseja realmente cadastrar esse produto?");
    if(!confirmar) return;

    //3. Setando estado loading
    setStatus('loading');
    setMensagem('');

    //4. Salvando no registro no banco
    try {
      await api.post('/salvarProduto', formData)

      //5. Confirmando sucesso do cadastro
      setStatus('success');
      setMensagem('Produto cadastrado com sucesso!');
      setModalAberto(true);
      setFormData(form);
    } catch (error) {
      setStatus('error');
      if (axios.isAxiosError(error)) {
        setMensagem(
          error.response?.data?.message ||
          error.response?.data?.erro ||
          'Erro ao cadastrar produto'
        )
      } else {
        setMensagem(error instanceof Error ? error.message : 'Erro inesperado');
      }
      setModalAberto(true);
    }
  };

  return (
    <div className="formulario-container">
      <Spinner loading={status === 'loading'} />

        {modalAberto && (
          <Resultado 
            mensagem={mensagem}
            tipo={status === 'success' ? 'sucesso' : 'erro'}
            onClose={fecharModal}
          />
        )}

      <header className="formulario-header">
        <div className="formulario-header-icon">
          <PackagePlus size={24} aria-hidden="true" />
        </div>
        <div>
          <h1 className="formulario-title">Cadastrar Produto</h1>
          <p className="formulario-subtitle">Adicione um novo produto ao sistema</p>
        </div>
      </header>

      <form className="formulario-form" onSubmit={handleSubmit} noValidate>
        <div className="formulario-group">
          <label htmlFor="codigoBarras" className="formulario-label">
            Código de Barras
          </label>
          <div className="formulario-input-wrapper">

            <input
              id="codigoBarras"
              name="codigoBarras"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="Digite o código de barras"
              className={`formulario-input ${erros.codigoBarras ? 'formulario-input--erro' : ''}`}
              value={formData.codigoBarras}
              onChange={handleChange}
            />
          </div>
          {erros.codigoBarras && <span className="form-error">{erros.codigoBarras}</span>}
        </div>

        <div className="formulario-group">
          <label htmlFor="nome" className="formulario-label">
            Nome do Produto
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            autoComplete="off"
            placeholder="Digite o nome do produto"
            maxLength={255}
            className={`formulario-input ${erros.nome ? 'formulario-input--erro' : ''}`}
            value={formData.nome}
            onChange={handleChange}
          />
          {erros.nome && <span className="form-error">{erros.nome}</span>}
          <span className="formulario-hint">{formData.nome.length}/255 caracteres</span>
        </div>


        <button
          type="submit"
          className="btn-submit"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Cadastrando...' : 'Cadastrar Produto'}
        </button>
      </form>
    </div>
  );
};

export default Produtos;
