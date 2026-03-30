import { useEffect, useState } from 'react';

const URL_BASE = 'http://localhost:8000';

function HistoricoVendas({ token, onVoltar }) {
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const buscarHistorico = async () => {
      try {
        setCarregando(true);
        setErro('');

        const response = await fetch(`${URL_BASE}/venda/historico`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          setErro(data.detail || 'Erro ao carregar histórico de vendas.');
          setHistorico([]);
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
  }, [token]);

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
        <h2>Histórico de Vendas</h2>

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

      <div style={{ marginTop: '25px' }}>
        {carregando && <p>Carregando histórico...</p>}

        {!carregando && erro && (
          <p style={{ color: 'red', fontWeight: 'bold' }}>{erro}</p>
        )}

        {!carregando && !erro && historico.length === 0 && (
          <p>Nenhuma venda encontrada.</p>
        )}

        {!carregando && !erro && historico.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {historico.map((venda) => (
              <div
                key={venda.id_venda}
                style={{
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '20px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                {/* Removemos o display flex daqui para empilhar os itens */}
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ margin: 0 }}>Venda #{venda.id_venda}</h3>
                  
                  <p style={{ margin: '8px 0 5px 0' }}>
                    <strong>Data:</strong>{' '}
                    {new Date(venda.data_hora + 'Z').toLocaleString('pt-BR')}
                  </p>

                  {/* Movemos o Total para cá, logo abaixo da data! */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: 'green'
                    }}
                  >
                    Total: R$ {Number(venda.valor_total).toFixed(2)}
                  </p>
                </div>

                <div>
                  <h4 style={{ marginBottom: '10px' }}>Itens da venda</h4>

                  {venda.itens && venda.itens.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {venda.itens.map((item, index) => (
                        <li key={index} style={{ marginBottom: '6px' }}>
                          {item.nome_prod} - R$ {Number(item.preco_prod).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p style={{ fontStyle: 'italic', color: '#668' }}>
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