// src/pages/Produtos/Produtos.tsx
import { PackagePlus } from 'lucide-react';
import './Produtos.css';
import Spinner from '../Spinner/Spinner';
import Resultado from '../Mensagem/Resultado';
import { useCadastroProduto } from '../../../hooks/useCadastroProduto';
import ProdutosForm from '../ProdutoForm/ProdutoForm';
import ProdutosLista from '../ProdutoLista/ProdutoLista';


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

    <ProdutosForm
        formData={formData}
        erros={erros}
        status={status}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />

      <ProdutosLista />

    </div>
  );
};

export default Produtos;
