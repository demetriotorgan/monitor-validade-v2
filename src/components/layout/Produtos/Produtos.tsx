// src/pages/Produtos/Produtos.tsx

import { useState, type FormEvent, type ChangeEvent } from 'react';
import { PackagePlus} from 'lucide-react';
import './Produtos.css';

interface ProdutoFormData {
  codigoBarras: string;
  nome: string;
}

const Produtos = () => {
  const [formData, setFormData] = useState<ProdutoFormData>({
    codigoBarras: '',
    nome: '',
  });

  const [erros, setErros] = useState<Partial<ProdutoFormData>>({});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [mensagem, setMensagem] = useState('');

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validar()) return;

    setStatus('loading');
    setMensagem('');

    try {
      const response = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const erro = await response.json().catch(() => ({ message: 'Erro ao cadastrar produto' }));
        throw new Error(erro.message || 'Erro ao cadastrar produto');
      }

      setStatus('success');
      setMensagem('Produto cadastrado com sucesso!');
      setFormData({ codigoBarras: '', nome: '' });
    } catch (error) {
      setStatus('error');
      setMensagem(error instanceof Error ? error.message : 'Erro inesperado');
    }
  };

  return (
    <div className="formulario-container">
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

        {mensagem && (
          <div
            className={`mensagem ${status === 'success' ? 'mensagem--sucesso' : ''} ${
              status === 'error' ? 'mensagem--erro' : ''
            }`}
            role="status"
          >
            {mensagem}
          </div>
        )}

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
