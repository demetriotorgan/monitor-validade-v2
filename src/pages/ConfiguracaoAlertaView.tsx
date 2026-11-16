// src/components/CapturaPage/ConfiguracaoAlertaView/ConfiguracaoAlertaView.tsx
import { useState } from 'react';
import './ConfiguracaoAlertaView.css';

interface ConfiguracaoAlertaViewProps {
  produtoNome: string;
  dataValidade: string;
  valorPadrao?: number;
  onConfirmar: (dias: number) => void;
  onCancelar: () => void;
}

export function ConfiguracaoAlertaView({
  produtoNome,
  dataValidade,
  valorPadrao = 7,
  onConfirmar,
  onCancelar,
}: ConfiguracaoAlertaViewProps) {
  const [valor, setValor] = useState<string>(String(valorPadrao));

  const dias = Number(valor);
  const valido = Number.isInteger(dias) && dias > 0;

  function handleConfirmar(): void {
    if (valido) {
      onConfirmar(dias);
    }
  }

  return (
    <section
      className="configuracao-alerta"
      role="form"
      aria-label="Configuração de alerta de validade"
    >
      <h2 className="configuracao-alerta__titulo">
        Configurar alerta de validade
      </h2>

      <div className="configuracao-alerta__resumo">
        <p>
          <strong>Produto:</strong> {produtoNome}
        </p>
        <p>
          <strong>Data de validade:</strong> {dataValidade}
        </p>
      </div>

      <label
        htmlFor="dias-antecedencia"
        className="configuracao-alerta__rotulo"
      >
        Alertar quantos dias antes do vencimento?
      </label>

      <input
        id="dias-antecedencia"
        className="configuracao-alerta__input"
        type="number"
        min={1}
        step={1}
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />

      <div className="configuracao-alerta__acoes">
        <button
          type="button"
          className="configuracao-alerta__botao configuracao-alerta__botao--primario"
          onClick={handleConfirmar}
          disabled={!valido}
        >
          Confirmar e cadastrar
        </button>

        <button
          type="button"
          className="configuracao-alerta__botao configuracao-alerta__botao--secundario"
          onClick={onCancelar}
        >
          Cancelar
        </button>
      </div>
    </section>
  );
}
