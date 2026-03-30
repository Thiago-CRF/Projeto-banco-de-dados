import { useEffect, useState } from 'react';

const URL_BASE = 'http://localhost:8000';

function GerenciarProdutos({ token, onVoltar }) {
  const [produtos, setProdutos] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);

  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    desc: '',
    preco: '',
    qnt_vendida: 0
  });

  const [produtoAtualizar, setProdutoAtualizar] = useState({
    id: '',
    nome: '',
    desc: '',
    preco: '',
    qnt_vendida: 0
  });

  const [idRemover, setIdRemover] = useState('');

  const buscarProdutos = async () => {
    try {
      setCarregando(true);

      const response = await fetch(`${URL_BASE}/produtos`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setProdutos(data);
      } else {
        setMensagem(`❌ ${data.detail || 'Erro ao listar produtos.'}`);
      }
    } catch (error) {
      setMensagem('❌ Erro de conexão ao buscar produtos.');
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    buscarProdutos();
  }, []);

  const handleCriarProduto = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await fetch(`${URL_BASE}/produtos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: novoProduto.nome,
          desc: novoProduto.desc,
          preco: Number(novoProduto.preco),
          qnt_vendida: Number(novoProduto.qnt_vendida)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('✅ Produto criado com sucesso!');
        setNovoProduto({
          nome: '',
          desc: '',
          preco: '',
          qnt_vendida: 0
        });
        buscarProdutos();
      } else {
        setMensagem(`❌ ${data.detail || 'Erro ao criar produto.'}`);
      }
    } catch (error) {
      setMensagem('❌ Erro de conexão ao criar produto.');
    }
  };

  const handleAtualizarProduto = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await fetch(`${URL_BASE}/produtos/${produtoAtualizar.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: produtoAtualizar.nome,
          desc: produtoAtualizar.desc,
          preco: Number(produtoAtualizar.preco),
          qnt_vendida: Number(produtoAtualizar.qnt_vendida)
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('✅ Produto atualizado com sucesso!');
        setProdutoAtualizar({
          id: '',
          nome: '',
          desc: '',
          preco: '',
          qnt_vendida: 0
        });
        buscarProdutos();
      } else {
        setMensagem(`❌ ${data.detail || 'Erro ao atualizar produto.'}`);
      }
    } catch (error) {
      setMensagem('❌ Erro de conexão ao atualizar produto.');
    }
  };

  const handleRemoverProduto = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await fetch(`${URL_BASE}/produtos/${idRemover}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem('✅ Produto removido com sucesso!');
        setIdRemover('');
        buscarProdutos();
      } else {
        setMensagem(`❌ ${data.detail || 'Erro ao remover produto.'}`);
      }
    } catch (error) {
      setMensagem('❌ Erro de conexão ao remover produto.');
    }
  };

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
        <h2>Gerenciar Produtos</h2>

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
          Voltar
        </button>
      </header>

      {mensagem && (
        <p style={{ marginTop: '20px', fontWeight: 'bold' }}>
          {mensagem}
        </p>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>Lista de Produtos</h3>

        <button
          onClick={buscarProdutos}
          style={{
            padding: '8px 15px',
            cursor: 'pointer',
            backgroundColor: '#e0e0e0',
            color: '#333',
            border: '1px solid #ccc',
            borderRadius: '8px',
            marginBottom: '15px'
          }}
        >
          Atualizar Lista
        </button>

        {carregando ? (
          <p>Carregando produtos...</p>
        ) : produtos.length === 0 ? (
          <p>Nenhum produto encontrado.</p>
        ) : (
          <div
            style={{
              overflowX: 'auto',
              border: '1px solid #ccc',
              borderRadius: '8px',
              marginBottom: '30px'
            }}
          >
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: 'white'
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#f2f2f2' }}>
                  <th style={{ padding: '12px', borderBottom: '1px solid #ccc', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #ccc', textAlign: 'left' }}>Nome</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #ccc', textAlign: 'left' }}>Descrição</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #ccc', textAlign: 'left' }}>Preço</th>
                  <th style={{ padding: '12px', borderBottom: '1px solid #ccc', textAlign: 'left' }}>Qtd. Vendida</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map((produto) => (
                  <tr key={produto.id}>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{produto.id}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{produto.nome}</td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                      {produto.desc ? produto.desc : '-'}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                      R$ {Number(produto.preco).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>{produto.qnt_vendida}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap'
        }}
      >
        <form
          onSubmit={handleCriarProduto}
          style={{
            flex: '1',
            minWidth: '300px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '20px',
            backgroundColor: '#fafafa'
          }}
        >
          <h3>Criar Produto</h3>

          <input
            type="text"
            placeholder="Nome"
            value={novoProduto.nome}
            onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
          />

          <input
            type="text"
            placeholder="Descrição"
            value={novoProduto.desc}
            onChange={(e) => setNovoProduto({ ...novoProduto, desc: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
          />

          <input
            type="number"
            step="0.01"
            placeholder="Preço"
            value={novoProduto.preco}
            onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
          />

          <input
            type="number"
            placeholder="Quantidade vendida"
            value={novoProduto.qnt_vendida}
            onChange={(e) => setNovoProduto({ ...novoProduto, qnt_vendida: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '15px', boxSizing: 'border-box' }}
          />

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              cursor: 'pointer',
              backgroundColor: '#e0e0e0',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Criar Produto
          </button>
        </form>

        <form
          onSubmit={handleAtualizarProduto}
          style={{
            flex: '1',
            minWidth: '300px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '20px',
            backgroundColor: '#fafafa'
          }}
        >
          <h3>Atualizar Produto</h3>

          <input
            type="number"
            placeholder="ID do produto"
            value={produtoAtualizar.id}
            onChange={(e) => setProdutoAtualizar({ ...produtoAtualizar, id: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
          />

          <input
            type="text"
            placeholder="Nome"
            value={produtoAtualizar.nome}
            onChange={(e) => setProdutoAtualizar({ ...produtoAtualizar, nome: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
          />

          <input
            type="text"
            placeholder="Descrição"
            value={produtoAtualizar.desc}
            onChange={(e) => setProdutoAtualizar({ ...produtoAtualizar, desc: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
          />

          <input
            type="number"
            step="0.01"
            placeholder="Preço"
            value={produtoAtualizar.preco}
            onChange={(e) => setProdutoAtualizar({ ...produtoAtualizar, preco: e.target.value })}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
          />

          <input
            type="number"
            placeholder="Quantidade vendida"
            value={produtoAtualizar.qnt_vendida}
            onChange={(e) => setProdutoAtualizar({ ...produtoAtualizar, qnt_vendida: e.target.value })}
            style={{ width: '100%', padding: '10px', marginBottom: '15px', boxSizing: 'border-box' }}
          />

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              cursor: 'pointer',
              backgroundColor: '#e0e0e0',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Atualizar Produto
          </button>
        </form>

        <form
          onSubmit={handleRemoverProduto}
          style={{
            flex: '1',
            minWidth: '300px',
            border: '1px solid #ccc',
            borderRadius: '10px',
            padding: '20px',
            backgroundColor: '#fafafa'
          }}
        >
          <h3>Remover Produto</h3>

          <input
            type="number"
            placeholder="ID do produto"
            value={idRemover}
            onChange={(e) => setIdRemover(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', marginBottom: '15px', boxSizing: 'border-box' }}
          />

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              cursor: 'pointer',
              backgroundColor: '#e0e0e0',
              color: '#333',
              border: '1px solid #ccc',
              borderRadius: '8px',
              fontWeight: 'bold'
            }}
          >
            Remover Produto
          </button>
        </form>
      </div>
    </div>
  );
}

export default GerenciarProdutos;