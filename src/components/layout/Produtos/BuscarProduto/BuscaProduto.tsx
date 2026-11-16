// src/components/BuscaProduto/BuscaProduto.tsx
import { Search } from 'lucide-react';

import './BuscaProduto.css';
import { useBuscarProdutos } from '../../../../hooks/useBuscarProdutos';
import Lista from '../../Lista/Lista';
import CardProduto from '../CardProduto/CardProduto';
import type { Produto } from '../../../../types/produto.types';
import { useNavigate } from 'react-router-dom';


const BuscaProduto = () => {
    const { termo, setTermo, produtos, status, mensagem } = useBuscarProdutos();
    const navigate = useNavigate();

    function handleCadastrarValidade(produto: Produto): void {
        navigate('/validade/captura', { state: { produto } });
    }


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
                    renderItem={(produto) => <CardProduto produto={produto} onCadastrarValidade={handleCadastrarValidade} />}
                />
            )}
        </div>
    );
};

export default BuscaProduto;
