// src/pages/Produtos/Produtos.tsx
import { PackagePlus } from 'lucide-react';
import './Produtos.css';
import Spinner from '../Spinner/Spinner';
import Resultado from '../Mensagem/Resultado';
import { useCadastroProduto } from '../../../hooks/useCadastroProduto';


const Produtos = () => {
const {formData, erros, status, mensagem, modalAberto, handleChange, handleSubmit, fecharModal} = useCadastroProduto();

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
