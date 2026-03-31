import { useEffect, useState } from 'react';

const URL_BASE = 'http://localhost:8000';

function HistoricoVendas({ token, onVoltar }) {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Estados para os filtros de data
  const [dataInicio, setDataInicio] = useState('');
  // Padrão para data fim: hoje (formato YYYY-MM-DD para o input)
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const buscarHistorico = async () => {
      try {
        setCarregando(true);
        setErro('');

        // Montagem da URL com Query Params
        let url = `${URL_BASE}/venda/historico`;
        const params = new URLSearchParams();

        if (dataInicio) {
          params.append('data_inicio', `${dataInicio}T00:00:00`);
        }
        
        if (dataFim) {
          params.append('data_fim', `${dataFim}T23:59:59`);
        }

        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          // Se a API retornar 404 (Nenhuma venda encontrada), limpamos a lista e mostramos a mensagem
          setHistorico([]);
          if (response.status !== 404) {
            setErro(data.detail || 'Erro ao carregar histórico.');
          }
          return;
        }

        setHistorico(data);
      } catch (error) {
        setErro('Erro de conexão com o servidor.');
        setHistorico([]);
      } finally {
        setCarregando(false);
      }
    };

    buscarHistorico();
  }, [token, dataInicio, dataFim]); // Atualiza sempre que mudar as datas ou o token

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f9', minHeight: '100vh', boxSizing: 'border-box' }}>
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
        <h2 style={{ margin: 0, color: '#333' }}>📋 Histórico de Vendas</h2>
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
          ← Voltar para as Configurações
        </button>
      </header>

      {/* --- SEÇÃO DE FILTROS --- */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '15px', 
        borderRadius: '8px', 
        marginBottom: '20px', 
        display: 'flex', 
        gap: '20px', 
        alignItems: 'center',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>De:</label>
          <input 
            type="date" 
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>Até:</label>
          <input 
            type="date" 
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
          />
        </div>

        {/* Botão para limpar filtros caso o usuário queira ver tudo de novo */}
        <button 
          onClick={() => { setDataInicio(''); setDataFim(new Date().toISOString().split('T')[0]); }}
          style={{ 
            marginTop: '20px',
            padding: '8px 15px', 
            backgroundColor: '#e0e0e0', 
            color: '#333', 
            border: '1px solid #ccc', 
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '12px', 
            fontWeight: 'bold'
          }}
        >
          Limpar Filtros
        </button>
      </div>

      <div style={{ marginTop: '20px' }}>
        {carregando ? (
          <p style={{ textAlign: 'center', fontSize: '18px' }}>Carregando vendas...</p>
        ) : erro ? (
          <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{erro}</p>
        ) : historico.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>Nenhuma venda encontrada para este período.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {historico.map((venda) => (
              <div
                key={venda.id_venda}
                style={{
                  backgroundColor: 'white',
                  padding: '20px',
                  borderRadius: '10px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  borderLeft: '5px solid #28a745',
                  display: 'flex',
                  flexDirection: 'column', // ⬅️ Isso faz os elementos empilharem verticalmente
                  gap: '15px'
                }}
              >
                {/* --- CABEÇALHO DA VENDA (ID, Data e Total) --- */}
                <div>
                  <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                    Venda #{venda.id_venda}
                  </h3>
                  <p style={{ margin: '8px 0 5px 0' }}>
                    <strong>Data:</strong>{' '}
                    {new Date(venda.data_hora).toLocaleString('pt-BR')}
                  </p>

                  <p
                    style={{
                      margin: '10px 0 0 0',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#28a745'
                    }}
                  >
                    Total: R$ {Number(venda.valor_total).toFixed(2)}
                  </p>
                </div>

                {/* --- LISTA DE ITENS EMBAIXO --- */}
                <div style={{ 
                  borderTop: '1px solid #eee', // ⬅️ Linha divisória sutil em cima dos itens
                  paddingTop: '15px' 
                }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#555' }}>Itens da venda</h4>

                  {venda.itens && venda.itens.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {venda.itens.map((item, index) => (
                        <li key={index} style={{ marginBottom: '8px', fontSize: '15px' }}>
                          <span style={{ fontWeight: 'bold' }}>{item.quantidade}x</span> {item.nome_prod} 
                          <span style={{ color: '#888', fontSize: '13px' }}> — R$ {Number(item.preco_prod).toFixed(2)} un.</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontStyle: 'italic', color: '#999', margin: 0 }}>
                      Nenhum item registrado.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default HistoricoVendas;