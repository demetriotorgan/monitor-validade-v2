// src/pages/Produtos/ProdutosForm.tsx

import { type FormEvent, type ChangeEvent } from 'react';

interface ProdutoFormData {
  codigoBarras: string;
  nome: string;
}

interface ProdutosFormProps {
  formData: ProdutoFormData;
  erros: Partial<ProdutoFormData>;
  status: 'idle' | 'loading' | 'success' | 'error';
  handleChange: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: FormEvent) => void;
}

const ProdutosForm = ({
  formData,
  erros,
  status,
  handleChange,
  handleSubmit,
}: ProdutosFormProps) => {
  return (
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
  );
};

export default ProdutosForm;
