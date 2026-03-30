import { useEffect, useState } from 'react';

const URL_BASE = 'http://localhost:8000';

function GerenciarProdutos({ token, onVoltar }) {
  const [produtos, setProdutos] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);

  // ESTADOS PARA A EDIÇÃO INLINE (Nos cartões)
  const [editandoId, setEditandoId] = useState(null); // Guarda o ID do produto que está sendo editado no momento
  const [dadosEdicao, setDadosEdicao] = useState({
    nome: '',
    desc: '',
    preco: '',
    qnt_vendida: 0 // Mantemos escondido só para não quebrar o backend
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

  // FUNÇÃO DE DELETAR (Com confirmação)
  const handleDeletarProduto = async (id, nomeProduto) => {
    // A mágica da confirmação acontece aqui:
    const confirmacao = window.confirm(`Tem certeza que deseja deletar o produto "${nomeProduto}"?`);
    
    if (!confirmacao) return; // Se a pessoa clicar em "Cancelar", a função para aqui.

    setMensagem('');
    try {
      const response = await fetch(`${URL_BASE}/produtos/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setMensagem('✅ Produto removido com sucesso!');
        buscarProdutos(); // Recarrega a lista sem o produto deletado
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
    // Preenche os inputs com os dados antigos
    setDadosEdicao({
      nome: produto.nome,
      desc: produto.desc || '',
      preco: produto.preco,
      qnt_vendida: produto.qnt_vendida // Preservamos a quantidade vendida para enviar ao back-end
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
          qnt_vendida: dadosEdicao.qnt_vendida // Enviamos o valor que já existia
        })
      });

      if (response.ok) {
        setMensagem('✅ Produto atualizado com sucesso!');
        setEditandoId(null); // Sai do modo de edição
        buscarProdutos(); // Atualiza a tela
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
        ) : produtos.length === 0 ? (
          <p>Nenhum produto encontrado.</p>
        ) : (
          /* MUDANÇA AQUI: flexDirection 'column' para empilhar em formato de lista */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {produtos.map((produto) => (
              <div
                key={produto.id}
                style={{
                  border: '1px solid #ccc', borderRadius: '10px', padding: '15px 20px',
                  backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              >
                
                {/* VERIFICA SE O CARTÃO ESTÁ EM MODO DE EDIÇÃO */}
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
                  
                  /* MODO DE VISUALIZAÇÃO DA LISTA (Dados na esquerda, Botões na direita) */
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    
                    {/* Informações do Produto */}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: '0 0 5px 0', fontSize: '18px' }}>{produto.nome}</h4>
                      <p style={{ margin: '0 0 5px 0', color: '#666', fontSize: '14px' }}>
                        {produto.desc || 'Sem descrição'}
                      </p>
                      <p style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'green' }}>
                        R$ {Number(produto.preco).toFixed(2)}
                      </p>
                    </div>

                    {/* Botões de Ação */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button 
                        onClick={() => iniciarEdicao(produto)} 
                        style={{ padding: '8px 15px', backgroundColor: '#ffc107', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GerenciarProdutos;