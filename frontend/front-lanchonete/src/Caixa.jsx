import { useState, useEffect } from 'react';
import Configuracoes from './configuracoes';

const URL_BASE = 'http://localhost:8000';

function Caixa({ token, onLogout }) {
  const [produtos, setProdutos] = useState([]);
  const [carrinho, setCarrinho] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [telaAtual, setTelaAtual] = useState('caixa');

  const realizarBusca = async () => {
    try {
      if (termoBusca.trim() === '') {
        const response = await fetch(`${URL_BASE}/produtos`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProdutos(data);
        }
        return;
      }

      const response = await fetch(
        `${URL_BASE}/produtos/pesquisa?nome_pesquisa=${encodeURIComponent(termoBusca)}`,
        {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProdutos(data);
      } else {
        setProdutos([]);
      }
    } catch (error) {
      console.error('Erro na busca:', error);
    }
  };

  const handleMudancaBusca = async (e) => {
    const valorDigitado = e.target.value;
    setTermoBusca(valorDigitado);

    if (valorDigitado.trim() === '') {
      const response = await fetch(`${URL_BASE}/produtos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProdutos(data);
      }
    }
  };

  useEffect(() => {
    realizarBusca();
  }, [token]);

  const adicionarAoCarrinho = (produto) => {
    setCarrinho((carrinhoAtual) => {
      const itemExistente = carrinhoAtual.find((item) => item.id === produto.id);

      if (itemExistente) {
        return carrinhoAtual.map((item) =>
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        return [...carrinhoAtual, { ...produto, quantidade: 1 }];
      }
    });
  };

  const removerDoCarrinho = (produtoId) => {
    setCarrinho((carrinhoAtual) => {
      const itemExistente = carrinhoAtual.find((item) => item.id === produtoId);

      if (itemExistente.quantidade > 1) {
        return carrinhoAtual.map((item) =>
          item.id === produtoId
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        );
      } else {
        return carrinhoAtual.filter((item) => item.id !== produtoId);
      }
    });
  };

  const valorTotal = carrinho.reduce(
    (total, item) => total + item.preco * item.quantidade,
    0
  );

  const finalizarVenda = async () => {
    if (carrinho.length === 0) {
      alert('O carrinho está vazio!');
      return;
    }

    const itensVenda = carrinho.map((item) => ({
      id: item.id,
      qnt_venda: item.quantidade
    }));

    try {
      const response = await fetch(`${URL_BASE}/vendas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(itensVenda)
      });

      if (response.ok) {
        alert('✅ Venda finalizada com sucesso!');
        setCarrinho([]);
      } else {
        const data = await response.json();
        alert(`Erro: ${data.detail || 'Erro ao finalizar venda.'}`);
      }
    } catch (error) {
      alert('Erro de conexão com o servidor.');
    }
  };

  if (telaAtual === 'config') {
    return <Configuracoes token={token} onVoltar={() => setTelaAtual('caixa')} />;
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f9', minHeight: '100vh', boxSizing: 'border-box' }}>
      {/* Cabeçalho */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #ccc', 
          paddingBottom: '15px',
          marginBottom: '20px'
        }}
      >
        <h2 style={{ margin: 0, color: '#333' }}>💲 Caixa - Lanchonete</h2>

        {/* Botões do cabeçalho aumentados */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={() => setTelaAtual('config')}
            style={{
              padding: '10px 18px', // Aumentado
              cursor: 'pointer',
              backgroundColor: '#007BFF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '14px', // Fonte maior
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0063ce'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007BFF'}
          >
            Painel administrativo
          </button>
          
          <button
            onClick={onLogout}
            style={{
              padding: '10px 18px', // Aumentado
              cursor: 'pointer',
              backgroundColor: '#dc3545', // Mantive vermelho por ser ação de sair/perigo
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 'bold',
              fontSize: '14px', // Fonte maior
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#c82333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#dc3545'}
          >
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal (Produtos e Carrinho) */}
      <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
        
        {/* Lado Esquerdo: Busca e Produtos */}
        <div style={{ flex: 1 }}>
          
          {/* Barra de Busca Alinhada */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
            <input
              type="text"
              placeholder="Buscar produto pelo nome..."
              value={termoBusca}
              onChange={handleMudancaBusca}
              style={{
                flex: 1, // Faz o input crescer para ocupar o espaço
                padding: '12px 15px',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '16px',
                maxWidth: '400px', // Limita a largura para não ficar gigante
              }}
            />
            <button
              onClick={realizarBusca}
              style={{
                padding: '12px 25px',
                cursor: 'pointer',
                backgroundColor: '#007BFF',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                fontSize: '16px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0063ce'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007BFF'}
            >
              Buscar
            </button>
          </div>

          {/* Grade de Produtos */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {produtos.map((produto) => (
              <div
                key={produto.id}
                style={{
                  width: '240px', // Cartões maiores
                  minHeight: '220px', // Altura mínima maior
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '15px',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column', // Organiza em coluna
                  justifyContent: 'space-between' // Espaça os elementos
                }}
              >
                {/* A mágica acontece aqui no flex: 1. Ele empurra o botão lá pra baixo! */}
                <div style={{ flex: 1, marginBottom: '15px' }}>
                  <h4 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#333' }}>
                    {produto.nome}
                  </h4>
                  {/* Nova descrição abaixo do nome */}
                  <p style={{ margin: '0 0 10px 0', fontSize: '13px', color: '#666', lineHeight: '1.4' }}>
                    {produto.desc || 'Sem descrição'}
                  </p>
                  <p style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>
                    R$ {Number(produto.preco).toFixed(2)}
                  </p>
                </div>

                <button
                  onClick={() => adicionarAoCarrinho(produto)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#007BFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0063ce'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007BFF'}
                >
                  Adicionar
                </button>
              </div>
            ))}
            
            {produtos.length === 0 && (
              <p style={{ color: '#666', fontSize: '16px' }}>Nenhum produto encontrado.</p>
            )}
          </div>
        </div>

        {/* Lado Direito: Carrinho (Visual levemente melhorado) */}
        <div
          style={{
            width: '355px', // largura 
            border: '1px solid #e0e0e0',
            borderRadius: '10px',
            padding: '20px',
            backgroundColor: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            position: 'sticky', // Faz o carrinho grudar na tela se rolar para baixo
            top: '115px'
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px', color: '#333' }}>
            🛒 Carrinho
          </h3>

          {carrinho.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', marginTop: '30px' }}>Carrinho vazio</p>
          ) : (
            <div>
              {carrinho.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px',
                    borderBottom: '1px dashed #ccc',
                    paddingBottom: '10px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Botão de Remover (-) */}
                    <button
                      onClick={() => removerDoCarrinho(item.id)}
                      style={{
                        padding: '4px 8px',
                        marginRight: '5px',
                        cursor: 'pointer',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}
                    >
                      -
                    </button>
                    
                    <span style={{ fontWeight: 'bold', marginRight: '5px' }}>{item.quantidade}x</span>
                    
                    {/* Botão de Adicionar (+) */}
                    <button
                      onClick={() => adicionarAoCarrinho(item)}
                      style={{
                        padding: '4px 8px',
                        marginRight: '10px',
                        cursor: 'pointer',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}
                    >
                      +
                    </button>

                    <span style={{ color: '#333' }}>{item.nome}</span>
                  </div>

                  <span style={{ fontWeight: 'bold' }}>
                    R$ {(item.preco * item.quantidade).toFixed(2)}
                  </span>
                </div>
              ))}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '25px',
                  fontSize: '22px',
                  fontWeight: 'bold',
                  color: '#333'
                }}
              >
                <span>Total:</span>
                <span style={{ color: '#28a745' }}>R$ {valorTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={finalizarVenda}
                style={{
                  width: '100%',
                  padding: '16px',
                  marginTop: '25px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#218838'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#28a745'}
              >
                Finalizar Venda
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Caixa;