// src/pages/Produtos/ProdutosLista.tsx

import { useEffect, useState } from 'react';
import { PackageSearch, Pencil, Trash2 } from 'lucide-react';
import './ProdutoLista.css';
import api from '../../../services/api';

interface Produto {
  _id: string;
  codigoBarras: string;
  nome: string;
  criadoEm: string;
  atualizadoEm: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

const ProdutosLista = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [status, setStatus] = useState<Status>('idle');
  const [mensagem, setMensagem] = useState('');

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
  }, []);

  const handleEditar = (produto: Produto) => {
    // TODO: implementar navegação ou modal de edição
    console.log('Editar produto:', produto);
  };

  const handleDeletar = (produto: Produto) => {
    // TODO: implementar confirmação e exclusão
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
    <div className="produtos-lista-container">
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
};

export default ProdutosLista;
