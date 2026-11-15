// src/pages/Produtos/ProdutosLista.tsx
import { forwardRef } from 'react';
import { PackageSearch, Pencil, Trash2 } from 'lucide-react';
import './ProdutoLista.css';
import { type Produto, type Status } from '../../../hooks/useListarProdutos';

interface ListaProdutosProps {
  produtos: Produto[];
  status: Status;
  mensagem: string;
}

const ProdutosLista = forwardRef<HTMLDivElement, ListaProdutosProps>(
  ({ produtos, status, mensagem }, ref) => {
    const handleEditar = (produto: Produto) => {
      console.log('Editar produto:', produto);
    };

    const handleDeletar = (produto: Produto) => {
      console.log('Deletar produto:', produto);
    };

    const formatarData = (dataIso: string) => {
      return new Date(dataIso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    };

    return (
      <div ref={ref} className="produtos-lista-container">
        <header className="produtos-lista-header">
          <div className="produtos-lista-header-icon">
            <PackageSearch size={24} aria-hidden="true" />
          </div>
          <div>
            <h1 className="produtos-lista-title">Produtos Cadastrados</h1>
            <p className="produtos-lista-subtitle">
              Gerencie os produtos salvos no sistema
            </p>
          </div>
        </header>

        {status === 'loading' && (
          <div className="produtos-lista-feedback produtos-lista-feedback--info">
            Carregando produtos...
          </div>
        )}

        {status === 'error' && (
          <div className="produtos-lista-feedback produtos-lista-feedback--erro">
            {mensagem || 'Erro ao carregar produtos'}
          </div>
        )}

        {status === 'success' && produtos.length === 0 && (
          <div className="produtos-lista-feedback produtos-lista-feedback--info">
            Nenhum produto cadastrado ainda.
          </div>
        )}

        {status === 'success' && produtos.length > 0 && (
          <ul className="produtos-lista">
            {produtos.map((produto) => (
              <li key={produto._id} className="produto-card">
                <div className="produto-card-info">
                  <h2 className="produto-card-nome">{produto.nome}</h2>
                  <span className="produto-card-codigo">
                    Código: {produto.codigoBarras}
                  </span>
                  <span className="produto-card-data">
                    Cadastrado em {formatarData(produto.criadoEm)}
                  </span>
                </div>

                <div className="produto-card-acoes">
                  <button
                    type="button"
                    className="produto-card-botao produto-card-botao--editar"
                    onClick={() => handleEditar(produto)}
                    aria-label={`Editar ${produto.nome}`}
                  >
                    <Pencil size={18} aria-hidden="true" />
                  </button>

                  <button
                    type="button"
                    className="produto-card-botao produto-card-botao--deletar"
                    onClick={() => handleDeletar(produto)}
                    aria-label={`Deletar ${produto.nome}`}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);

ProdutosLista.displayName = 'ProdutosLista';

export default ProdutosLista;
