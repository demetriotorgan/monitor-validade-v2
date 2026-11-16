// src/components/BuscaProduto/CardProduto/CardProduto.tsx
import { CalendarPlus } from 'lucide-react';

import './CardProduto.css';
import { formatarData } from '../../../../utils/datas/formatarData';
import type { Produto } from '../../../../types/produto.types';



interface CardProdutoProps {
    produto: Produto;
    onCadastrarValidade?: (produto: Produto) => void;
}

const CardProduto = ({ produto,onCadastrarValidade }: CardProdutoProps) => {
    return (
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
                <button
                    type="button"
                    className="produto-card-botao-validade"
                    aria-label={`Cadastrar validade para ${produto.nome}`}
                    onClick={()=> onCadastrarValidade?.(produto)}
                >
                    <CalendarPlus size={18} aria-hidden="true" />
                    Cadastrar Validade
                </button>
            </div>
        </>
    );
};

export default CardProduto;
