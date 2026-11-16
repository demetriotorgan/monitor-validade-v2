// src/components/CapturaPage/SucessoCadastroValidade/SucessoCadastroValidade.tsx
import { CheckCircle, Calendar, Package, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import './SucessoCadastroValidade.css';
import type { ValidadePayloadBackend } from '../types/validade.types';


interface SucessoCadastroValidadeProps {
  payload: ValidadePayloadBackend;  
}

export function SucessoCadastroValidade({payload}: SucessoCadastroValidadeProps) {

  const navigate = useNavigate();

  function handleVoltarParaValidades() {
    navigate('/monitoramento');
  }

  function handleVoltarAoInicio(){
    navigate('/validade')
  }

  const dataFormatada = new Date(payload.data.data_iso).toLocaleDateString(
    'pt-BR',
    {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    },
  );

  return (
    <div className="sucesso-cadastro-validade">
      <div className="sucesso-cadastro-validade__icone">
        <CheckCircle size={64} aria-hidden="true" />
      </div>

      <h1 className="sucesso-cadastro-validade__titulo">
        Validade cadastrada com sucesso!
      </h1>

      <p className="sucesso-cadastro-validade__subtitulo">
        O produto abaixo foi registrado para monitoramento:
      </p>

      <div className="sucesso-cadastro-validade__resumo">
        <div className="sucesso-cadastro-validade__item">
          <Package size={20} aria-hidden="true" />
          <span>
            <strong>Produto:</strong> {payload.produto.nome}
          </span>
        </div>

        <div className="sucesso-cadastro-validade__item">
          <Calendar size={20} aria-hidden="true" />
          <span>
            <strong>Validade:</strong> {dataFormatada}
          </span>
        </div>
      </div>

      <div className="sucesso-cadastro-validade__acoes">
        <button
          type="button"
          className="sucesso-cadastro-validade__botao--primario"
          onClick={handleVoltarParaValidades}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Ver validades cadastradas
        </button>
        
          <button
            type="button"
            className="sucesso-cadastro-validade__botao--secundario"
            onClick={handleVoltarAoInicio}
          >
            Cadastrar outra validade
          </button>
        
      </div>
    </div>
  );
}
