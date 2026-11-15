// src/pages/Produtos/Produtos.tsx
import { PackagePlus } from 'lucide-react';
import './Produtos.css';
import Spinner from '../Spinner/Spinner';
import Resultado from '../Mensagem/Resultado';
import { useCadastroProduto } from '../../../hooks/useCadastroProduto';
import ProdutosForm from '../ProdutoForm/ProdutoForm';
import ProdutosLista from '../ProdutoLista/ProdutoLista';
import { useListarProdutos } from '../../../hooks/useListarProdutos';
import { useEffect, useRef } from 'react';


const Produtos = () => {
  const listaRef = useRef<HTMLDivElement>(null);
  const { produtos, status: listaStatus, mensagem: listaMensagem, recarregar } = useListarProdutos();
  const { formData, erros, status, mensagem, modalAberto, handleChange, handleSubmit, fecharModal } = useCadastroProduto({ onSucesso: recarregar });

  useEffect(() => {
    if (status === 'success') {
      listaRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  }, [status]);

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

      <ProdutosLista
        ref={listaRef}
        produtos={produtos}
        status={listaStatus}
        mensagem={listaMensagem}
      />

    </div>
  );
};

export default Produtos;
