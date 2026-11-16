// src/components/produto/ProdutoSelecionado/ProdutoSelecionado.tsx
import './ProdutoSelecionado.css';
import type { Produto } from '../../../../types/produto.types'; 

interface ProdutoSelecionadoProps {
  produto: Produto;
  titulo?: string;
}

export function ProdutoSelecionado({
  produto,
  titulo,
}: ProdutoSelecionadoProps) {
  return (
    <section className="produto-selecionado">
      {titulo && (
        <h2 className="produto-selecionado-titulo">
          {titulo}
        </h2>
      )}

      <p className="produto-selecionado-nome">
        {produto.nome}
      </p>

      <p className="produto-selecionado-codigo">
        Código: {produto.codigoBarras}
      </p>
    </section>
  );
}
