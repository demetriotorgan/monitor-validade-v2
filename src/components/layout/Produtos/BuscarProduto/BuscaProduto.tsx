// src/components/BuscaProduto/BuscaProduto.tsx
import { Search } from 'lucide-react';

import './BuscaProduto.css';
import { useBuscarProdutos } from '../../../../hooks/useBuscarProdutos';
import Lista from '../../Lista/Lista';
import { formatarData } from '../../../../utils/datas/formatarData';

const BuscaProduto = () => {
    const { termo, setTermo, produtos, status, mensagem } = useBuscarProdutos();

    // Log incremental: apenas imprime no console enquanto não renderizamos
    //   console.log({
    //     termo,
    //     status,
    //     mensagem,
    //     total: produtos.length,
    //     produtos,
    //   });

    return (
        <div className="busca-produto">
            <div className="busca-produto-input-wrapper">
                <Search size={20} aria-hidden="true" className="busca-produto-icone" />
                <input
                    type="text"
                    className="busca-produto-input"
                    placeholder="Busque por nome ou código de barras..."
                    value={termo}
                    onChange={(e) => setTermo(e.target.value)}
                    aria-label="Buscar produto"
                />
            </div>

            {status === 'loading' && (
                <span className="busca-produto-feedback">
                    <span className="busca-produto-feedback--loading">Buscando</span>
                </span>
            )}
            {status === 'error' && (
                <span className="busca-produto-feedback busca-produto-feedback--erro">
                    {mensagem}
                </span>
            )}

            {status === 'success' && (
                <Lista
                    items={produtos}
                    keyExtractor={(produto) => produto._id}
                    className="produtos-lista"
                    itemClassName="produto-card"
                    renderEmpty={() =>
                        termo.trim() ? (
                            <span className="busca-produto-feedback">
                                Nenhum produto encontrado.
                            </span>
                        ) : null
                    }
                    renderItem={(produto) => (
                        <>
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

                            </div>
                        </>
                    )}
                />
            )}
        </div>
    );
};

export default BuscaProduto;
