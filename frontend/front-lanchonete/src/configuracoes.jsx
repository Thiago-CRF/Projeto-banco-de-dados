import { useState } from 'react';
import HistoricoVendas from './HistoricoVendas';
import CriarUsuario from './Criarusuario';
import GerenciarProdutos from './GerenciarProdutos';

function Configuracoes({ token, onVoltar }) {
  const [telaInterna, setTelaInterna] = useState('menu');

  if (telaInterna === 'historico-vendas') {
    return (
      <HistoricoVendas
        token={token}
        onVoltar={() => setTelaInterna('menu')}
      />
    );
  }

  if (telaInterna === 'criar-usuario') {
    return (
      <CriarUsuario
        token={token}
        onVoltar={() => setTelaInterna('menu')}
      />
    );
  }

  if (telaInterna === 'gerenciar-produtos') {
    return (
      <GerenciarProdutos
        token={token}
        onVoltar={() => setTelaInterna('menu')}
      />
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #ccc',
          paddingBottom: '10px'
        }}
      >
        <h2>Configurações</h2>

        <button
          onClick={onVoltar}
          style={{
            padding: '8px 15px',
            cursor: 'pointer',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          Voltar para o Caixa
        </button>
      </header>

      <div style={{ marginTop: '30px' }}>
        <h3>Escolha uma opção</h3>

        <div
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            marginTop: '20px'
          }}
        >
          {/* Histórico */}
          <button
            onClick={() => setTelaInterna('historico-vendas')}
            style={{
              width: '260px',
              height: '120px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: '#e0e0e0',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '10px'
            }}
          >
            Histórico de Vendas
          </button>

          {/* Criar usuário */}
          <button
            onClick={() => setTelaInterna('criar-usuario')}
            style={{
              width: '260px',
              height: '120px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: '#e0e0e0',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '10px'
            }}
          >
            Criar Usuário
          </button>

          {/* NOVO: Gerenciar produtos */}
          <button
            onClick={() => setTelaInterna('gerenciar-produtos')}
            style={{
              width: '260px',
              height: '120px',
              fontSize: '20px',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: '#e0e0e0',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '10px'
            }}
          >
            Gerenciar Produtos
          </button>
        </div>
      </div>
    </div>
  );
}

export default Configuracoes;