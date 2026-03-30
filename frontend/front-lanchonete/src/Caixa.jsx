import { useState, useEffect } from 'react';

const URL_BASE = 'http://localhost:8000';

function Caixa({ token, onLogout }) {
  const [produtos, setProdutos] = useState([]);
  
  // NOVO ESTADO: A memória do nosso carrinho de compras
  const [carrinho, setCarrinho] = useState([]);

  useEffect(() => {
    const buscarProdutos = async () => {
      try {
        const response = await fetch(`${URL_BASE}/produtos`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProdutos(data);
        }
      } catch (error) {
        console.error("Erro de conexão:", error);
      }
    };
    buscarProdutos();
  }, [token]);

  // FUNÇÃO DO BOTÃO: Adicionar produto ao carrinho
  const adicionarAoCarrinho = (produto) => {
    setCarrinho((carrinhoAtual) => {
      // CORREÇÃO 1: Trocamos id_prod por id
      const itemExistente = carrinhoAtual.find(item => item.id === produto.id);

      if (itemExistente) {
        return carrinhoAtual.map(item =>
          // CORREÇÃO 2: Trocamos id_prod por id
          item.id === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item
        );
      } else {
        return [...carrinhoAtual, { ...produto, quantidade: 1 }];
      }
    });
  };

  // FUNÇÃO DOS BOTÕES: Remover item ou diminuir quantidade
  const removerDoCarrinho = (produtoId) => {
    setCarrinho((carrinhoAtual) => {
      // Encontra o item que queremos alterar
      const itemExistente = carrinhoAtual.find(item => item.id === produtoId);

      // Se só tem 1, tira do carrinho filtrando tudo que for diferente do ID dele
      if (itemExistente.quantidade === 1) {
        return carrinhoAtual.filter(item => item.id !== produtoId);
      } 
      
      // Se tem mais de 1, diminui a quantidade
      else {
        return carrinhoAtual.map(item =>
          item.id === produtoId
            ? { ...item, quantidade: item.quantidade - 1 }
            : item
        );
      }
    });
  };

  // CÁLCULO DO TOTAL: Soma (Preço * Quantidade) de todos os itens do carrinho (usando o reduce)
  const valorTotal = carrinho.reduce((acumulador, item) => {
    return acumulador + (item.preco * item.quantidade);
  }, 0); // O 0 é o valor inicial do acumulador

  // FUNÇÃO DO BOTÃO: Finalizar a venda e enviar para o banco
  const finalizarVenda = async () => {
    // 1. Prepara os dados: o FastAPI espera uma lista com 'id' e 'qnt_venda'
    const itensParaVenda = carrinho.map((item) => ({
      id: item.id,
      qnt_venda: item.quantidade
    }));

    try {
      // 2. Faz o disparo (POST) para a rota de vendas
      const response = await fetch(`${URL_BASE}/venda`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Agora sim enviamos como JSON!
          'Authorization': `Bearer ${token}`  // A chave de segurança
        },
        body: JSON.stringify(itensParaVenda)  // Converte a nossa lista em texto JSON
      });

      if (response.ok) {
        // 3. Se o banco de dados salvou direitinho:
        alert('✅ Venda finalizada e salva com sucesso!');
        setCarrinho([]); // Limpa o carrinho para o próximo cliente!
      } else {
        // Se der algum erro (ex: produto sem estoque, token expirado)
        const erro = await response.json();
        alert(`❌ Erro ao vender: ${erro.detail || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      alert('❌ Erro ao conectar com o servidor.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        <h2>Caixa Aberto - Lanchonete</h2>
        <button onClick={onLogout} style={{ padding: '5px 15px', cursor: 'pointer', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '5px' }}>
          Sair
        </button>
      </header>

      {/* Dividindo a tela em duas colunas com Flexbox */}
      <div style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
        
        {/* COLUNA ESQUERDA: CARDÁPIO (Ocupa 2/3 da tela) */}
        <div style={{ flex: 2 }}>
          <h3>Cardápio</h3>
          {produtos.length === 0 ? <p>Carregando produtos...</p> : (
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              {/* CORREÇÃO 3: Trocamos prod.id_prod por prod.id no 'key' */}
                {produtos.map((prod) => (
                <div key={prod.id} style={{ border: '1px solid #aaa', padding: '15px', borderRadius: '8px', width: '150px', textAlign: 'center' }}>
                  <h4>{prod.nome}</h4>
                  <p style={{ color: 'green', fontWeight: 'bold' }}>R$ {prod.preco}</p>
                  
                  {/* AGORA O BOTÃO ESTÁ VIVO! Ele chama a função passando o produto clicado */}
                  <button 
                    onClick={() => adicionarAoCarrinho(prod)} 
                    style={{ padding: '5px', cursor: 'pointer', width: '100%', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px' }}
                  >
                    Adicionar
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* COLUNA DIREITA: CARRINHO DE COMPRAS (Ocupa 1/3 da tela) */}
        <div style={{ flex: 1, backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3>🛒 Carrinho</h3>
          
          {carrinho.length === 0 ? (
            <p style={{ fontStyle: 'italic', color: '#666' }}>Seu carrinho está vazio.</p>
          ) : (
            <div>
              {/* Lista os itens do carrinho */}
              {carrinho.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #ccc', padding: '10px 0' }}>
                  
                  {/* Agrupando os botões e o nome do produto */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    
                    {/* Botão de Menos */}
                    <button 
                      onClick={() => removerDoCarrinho(item.id)} 
                      style={{ cursor: 'pointer', padding: '2px 8px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                    >
                      -
                    </button>
                    
                    <span>{item.quantidade}x</span>
                    
                    {/* Botão de Mais (reaproveitando a função antiga!) */}
                    <button 
                      onClick={() => adicionarAoCarrinho(item)} 
                      style={{ cursor: 'pointer', padding: '2px 8px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
                    >
                      +
                    </button>
                    
                    <span style={{ marginLeft: '5px' }}>{item.nome}</span>
                  </div>

                  {/* Preço total do item */}
                  <span>R$ {(item.preco * item.quantidade).toFixed(2)}</span>
                </div>
              ))}
              
              {/* Rodapé do Carrinho com o Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '20px', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>R$ {valorTotal.toFixed(2)}</span>
              </div>
              
             {/* Botão VIVO para finalizar a venda */}
            <button 
                onClick={finalizarVenda}
                style={{ width: '100%', padding: '15px', marginTop: '20px', backgroundColor: '#28a745', color: 'white', fontSize: '18px', fontWeight: 'bold', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
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