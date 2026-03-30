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
      try {
        const response = await fetch(`${URL_BASE}/produtos`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProdutos(data);
        }
      } catch (error) {
        console.error('Erro ao recarregar o cardápio:', error);
      }
    }
  };

  useEffect(() => {
    const buscarProdutos = async () => {
      try {
        const response = await fetch(`${URL_BASE}/produtos`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setProdutos(data);
        }
      } catch (error) {
        console.error('Erro de conexão:', error);
      }
    };

    buscarProdutos();
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
      }

      return [...carrinhoAtual, { ...produto, quantidade: 1 }];
    });
  };

  const removerDoCarrinho = (produtoId) => {
    setCarrinho((carrinhoAtual) => {
      const itemExistente = carrinhoAtual.find((item) => item.id === produtoId);

      if (itemExistente.quantidade === 1) {
        return carrinhoAtual.filter((item) => item.id !== produtoId);
      }

      return carrinhoAtual.map((item) =>
        item.id === produtoId
          ? { ...item, quantidade: item.quantidade - 1 }
          : item
      );
    });
  };

  const valorTotal = carrinho.reduce((acumulador, item) => {
    return acumulador + item.preco * item.quantidade;
  }, 0);

  const finalizarVenda = async () => {
    const itensParaVenda = carrinho.map((item) => ({
      id: item.id,
      qnt_venda: item.quantidade
    }));

    try {
      const response = await fetch(`${URL_BASE}/venda`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(itensParaVenda)
      });

      if (response.ok) {
        alert('✅ Venda finalizada e salva com sucesso!');
        setCarrinho([]);
      } else {
        const erro = await response.json();
        alert(`❌ Erro ao vender: ${erro.detail || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error('Erro de conexão:', error);
      alert('❌ Erro ao conectar com o servidor.');
    }
  };

  if (telaAtual === 'configuracoes') {
    return (
      <Configuracoes
        token={token}
        onVoltar={() => setTelaAtual('caixa')}
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
        <h2>Caixa Aberto - Lanchonete</h2>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => setTelaAtual('configuracoes')}
            style={{
              padding: '5px 15px',
              cursor: 'pointer',
              backgroundColor: '#6f42c1',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            Configurações
          </button>

          <button
            onClick={onLogout}
            style={{
              padding: '5px 15px',
              cursor: 'pointer',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '5px'
            }}
          >
            Sair
          </button>
        </div>
      </header>

      <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        <div style={{ flex: 2 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px'
            }}
          >
            <h3 style={{ margin: 0 }}>Cardápio</h3>

            <div style={{ display: 'flex', gap: '5px' }}>
              <input
                type="text"
                placeholder="Buscar produto..."
                value={termoBusca}
                onChange={handleMudancaBusca}
                onKeyDown={(e) => e.key === 'Enter' && realizarBusca()}
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  width: '200px'
                }}
              />

              <button
                onClick={realizarBusca}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#17a2b8',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                Buscar
              </button>
            </div>
          </div>

          {produtos.length === 0 ? (
            <p>Carregando produtos...</p>
          ) : (
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {produtos.map((prod) => (
                <div
                  key={prod.id}
                  style={{
                    border: '1px solid #aaa',
                    padding: '15px',
                    borderRadius: '8px',
                    width: '150px',
                    textAlign: 'center'
                  }}
                >
                  <h4>{prod.nome}</h4>
                  <p style={{ color: 'green', fontWeight: 'bold' }}>
                    R$ {Number(prod.preco).toFixed(2)}
                  </p>

                  <button
                    onClick={() => adicionarAoCarrinho(prod)}
                    style={{
                      padding: '5px',
                      cursor: 'pointer',
                      width: '100%',
                      backgroundColor: '#007BFF',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px'
                    }}
                  >
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            flex: 1,
            backgroundColor: '#f9f9f9',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #ddd'
          }}
        >
          <h3>🛒 Carrinho</h3>

          {carrinho.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: '#666' }}>
              Seu carrinho está vazio.
            </p>
          ) : (
            <div>
              {carrinho.map((item, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px dashed #ccc',
                    padding: '10px 0'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <button
                      onClick={() => removerDoCarrinho(item.id)}
                      style={{
                        cursor: 'pointer',
                        padding: '2px 8px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}
                    >
                      -
                    </button>

                    <span>{item.quantidade}x</span>

                    <button
                      onClick={() => adicionarAoCarrinho(item)}
                      style={{
                        cursor: 'pointer',
                        padding: '2px 8px',
                        backgroundColor: '#007BFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}
                    >
                      +
                    </button>

                    <span style={{ marginLeft: '5px' }}>{item.nome}</span>
                  </div>

                  <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '20px',
                  fontSize: '20px',
                  fontWeight: 'bold'
                }}
              >
                <span>Total:</span>
                <span>R$ {valorTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={finalizarVenda}
                style={{
                  width: '100%',
                  padding: '15px',
                  marginTop: '20px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
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