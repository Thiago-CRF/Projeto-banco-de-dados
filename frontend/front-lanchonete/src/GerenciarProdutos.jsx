import { useEffect, useState } from 'react';

const URL_BASE = 'http://localhost:8000';

function GerenciarProdutos({ token, onVoltar }) {
  const [produtos, setProdutos] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);

  // ESTADOS PARA ADICIONAR NOVO PRODUTO
  const [adicionando, setAdicionando] = useState(false);
  const [novoProduto, setNovoProduto] = useState({
    nome: '',
    desc: '',
    preco: ''
  });

  // ESTADOS PARA A EDIÇÃO INLINE
  const [editandoId, setEditandoId] = useState(null);
  const [dadosEdicao, setDadosEdicao] = useState({
    nome: '',
    desc: '',
    preco: '',
    qnt_vendida: 0
  });

  const buscarProdutos = async () => {
    try {
      setCarregando(true);
      const response = await fetch(`${URL_BASE}/produtos`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
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

  // FUNÇÃO DE ADICIONAR PRODUTO
  const salvarNovoProduto = async () => {
    setMensagem('');
    
    // Validação básica
    if (!novoProduto.nome || !novoProduto.preco) {
      setMensagem('❌ Preencha pelo menos o nome e o preço do produto.');
      return;
    }

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
          qnt_vendida: 0 // Conforme o schema ProdutoBase exige
        })
      });

      if (response.ok) {
        setMensagem(`✅ Produto "${novoProduto.nome}" adicionado com sucesso!`);
        setAdicionando(false); // Fecha o card de adição
        setNovoProduto({ nome: '', desc: '', preco: '' }); // Limpa o formulário
        buscarProdutos(); // Recarrega a lista
      } else {
        const data = await response.json();
        setMensagem(`❌ ${data.detail || 'Erro ao adicionar produto.'}`);
      }
    } catch (error) {
      setMensagem('❌ Erro de conexão ao adicionar produto.');
    }
  };

  // FUNÇÃO DE DELETAR
  const handleDeletarProduto = async (id, nomeProduto) => {
    const confirmacao = window.confirm(`Tem certeza que deseja deletar o produto "${nomeProduto}"?`);
    if (!confirmacao) return;

    setMensagem('');
    try {
      const response = await fetch(`${URL_BASE}/produtos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setMensagem('✅ Produto removido com sucesso!');
        buscarProdutos();
      } else {
        const data = await response.json();
        setMensagem(`❌ ${data.detail || 'Erro ao remover produto.'}`);
      }
    } catch (error) {
      setMensagem('❌ Erro de conexão ao remover produto.');
    }
  };

  // FUNÇÕES DE EDIÇÃO
  const iniciarEdicao = (produto) => {
    setEditandoId(produto.id);
    setDadosEdicao({
      nome: produto.nome,
      desc: produto.desc || '',
      preco: produto.preco,
      qnt_vendida: produto.qnt_vendida
    });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
  };

  const salvarEdicao = async (id) => {
    setMensagem('');
    try {
      const response = await fetch(`${URL_BASE}/produtos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          nome: dadosEdicao.nome,
          desc: dadosEdicao.desc,
          preco: Number(dadosEdicao.preco),
          qnt_vendida: dadosEdicao.qnt_vendida
        })
      });

      if (response.ok) {
        setMensagem('✅ Produto atualizado com sucesso!');
        setEditandoId(null);
        buscarProdutos();
      } else {
        const data = await response.json();
        setMensagem(`❌ ${data.detail || 'Erro ao atualizar produto.'}`);
      }
    } catch (error) {
      setMensagem('❌ Erro de conexão ao atualizar produto.');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <header
        style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '2px solid #ccc', paddingBottom: '10px'
        }}
      >
        <h2>Gerenciar Produtos</h2>
        <button
          onClick={onVoltar}
          style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          Voltar
        </button>
      </header>

      {mensagem && (
        <p style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px', fontWeight: 'bold' }}>
          {mensagem}
        </p>
      )}

      <div style={{ marginTop: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3>Catálogo Atual</h3>
          <button
            onClick={buscarProdutos}
            style={{ padding: '8px 15px', cursor: 'pointer', backgroundColor: '#e0e0e0', color: '#333', border: '1px solid #ccc', borderRadius: '5px' }}
          >
            Atualizar Lista
          </button>
        </div>

        {carregando ? (
          <p>Carregando produtos...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            {/* ⬇️ NOVO: CARD DE ADICIONAR PRODUTO ⬇️ */}
            {adicionando ? (
              <div style={{ border: '2px dashed #28a745', borderRadius: '10px', padding: '15px 20px', backgroundColor: '#f9fff9' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#28a745' }}>Novo Produto</h4>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={novoProduto.nome}
                    onChange={(e) => setNovoProduto({ ...novoProduto, nome: e.target.value })}
                    placeholder="Nome"
                    style={{ flex: 1, minWidth: '150px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <input
                    type="text"
                    value={novoProduto.desc}
                    onChange={(e) => setNovoProduto({ ...novoProduto, desc: e.target.value })}
                    placeholder="Descrição (opcional)"
                    style={{ flex: 2, minWidth: '200px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={novoProduto.preco}
                    onChange={(e) => setNovoProduto({ ...novoProduto, preco: e.target.value })}
                    placeholder="Preço"
                    style={{ width: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={salvarNovoProduto} style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Adicionar
                    </button>
                    <button onClick={() => setAdicionando(false)} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setAdicionando(true)}
                style={{
                  border: '2px dashed #aaa', borderRadius: '10px', padding: '10px 20px',
                  backgroundColor: '#fafafa', cursor: 'pointer', textAlign: 'center', transition: '0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
              >
                <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#555' }}>
                  + Adicionar Novo Produto
                </span>
              </div>
            )}
            {/* ⬆️ FIM DO CARD DE ADICIONAR PRODUTO ⬆️ */}

            {produtos.length === 0 ? (
              <p style={{ marginTop: '10px' }}>Nenhum produto cadastrado no momento.</p>
            ) : (
              produtos.map((produto) => (
                <div
                  key={produto.id}
                  style={{
                    border: '1px solid #ccc', borderRadius: '10px', padding: '15px 20px',
                    backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  {/* EDIÇÃO INLINE */}
                  {editandoId === produto.id ? (
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                      <input
                        type="text"
                        value={dadosEdicao.nome}
                        onChange={(e) => setDadosEdicao({ ...dadosEdicao, nome: e.target.value })}
                        placeholder="Nome"
                        style={{ flex: 1, minWidth: '150px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <input
                        type="text"
                        value={dadosEdicao.desc}
                        onChange={(e) => setDadosEdicao({ ...dadosEdicao, desc: e.target.value })}
                        placeholder="Descrição"
                        style={{ flex: 2, minWidth: '200px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={dadosEdicao.preco}
                        onChange={(e) => setDadosEdicao({ ...dadosEdicao, preco: e.target.value })}
                        placeholder="Preço"
                        style={{ width: '100px', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      />
                      
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => salvarEdicao(produto.id)} style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Salvar
                        </button>
                        <button onClick={cancelarEdicao} style={{ padding: '8px 15px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* VISUALIZAÇÃO DA LISTA */
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{produto.nome}</h4>
                        <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                          {produto.desc || 'Sem descrição'}
                        </p>
                        <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'green' }}>
                          R$ {Number(produto.preco).toFixed(2)}
                        </p>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button 
                          onClick={() => iniciarEdicao(produto)} 
                          style={{ padding: '8px 15px', backgroundColor: '#e0e0e0', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDeletarProduto(produto.id, produto.nome)} 
                          style={{ padding: '8px 15px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                          Deletar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default GerenciarProdutos;