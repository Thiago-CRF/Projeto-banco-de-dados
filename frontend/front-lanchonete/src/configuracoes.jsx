import { useState } from 'react';
import HistoricoVendas from './HistoricoVendas';
import CriarUsuario from './Criarusuario';
import GerenciarProdutos from './GerenciarProdutos';
import RelatorioProdutos from './RelatorioProdutos'; // IMPORTAMOS A NOVA TELA

function Configuracoes({ token, onVoltar }) {
  const [telaInterna, setTelaInterna] = useState('menu');

  // Redirecionamento das telas
  if (telaInterna === 'historico-vendas') return <HistoricoVendas token={token} onVoltar={() => setTelaInterna('menu')} />;
  if (telaInterna === 'criar-usuario') return <CriarUsuario token={token} onVoltar={() => setTelaInterna('menu')} />;
  if (telaInterna === 'gerenciar-produtos') return <GerenciarProdutos token={token} onVoltar={() => setTelaInterna('menu')} />;
  if (telaInterna === 'relatorio-produtos') return <RelatorioProdutos token={token} onVoltar={() => setTelaInterna('menu')} />;

  // Estilo padronizado para os cartões do menu (para não repetir código)
  const cardStyle = {
    width: '240px',
    height: '140px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    cursor: 'pointer',
    backgroundColor: 'white',
    color: '#333',
    border: '1px solid #e0e0e0',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s, boxShadow 0.2s'
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f9', minHeight: '100vh', boxSizing: 'border-box' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #ccc',
          paddingBottom: '15px',
          marginBottom: '30px'
        }}
      >
        <h2 style={{ margin: 0, color: '#333' }}>⚙️ Configurações</h2>

        <button
          onClick={onVoltar}
          style={{
            padding: '10px 18px',
            cursor: 'pointer',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '14px'
          }}
        >
          ← Voltar para o Caixa
        </button>
      </header>

      <div>
        <h3 style={{ color: '#555', marginBottom: '20px' }}>Painel Administrativo</h3>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          
          <button
            onClick={() => setTelaInterna('historico-vendas')}
            style={cardStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: '30px' }}>🧾</span>
            Histórico de Vendas
          </button>

          <button
            onClick={() => setTelaInterna('relatorio-produtos')}
            style={cardStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: '30px' }}>📊</span>
            Relatório de Produtos
          </button>

          <button
            onClick={() => setTelaInterna('gerenciar-produtos')}
            style={cardStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: '30px' }}>🍔</span>
            Gerenciar Produtos
          </button>

          <button
            onClick={() => setTelaInterna('criar-usuario')}
            style={cardStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ fontSize: '30px' }}>👤</span>
            Criar Usuário
          </button>

        </div>
      </div>
    </div>
  );
}

export default Configuracoes;