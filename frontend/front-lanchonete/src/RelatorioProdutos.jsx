import { useEffect, useState } from 'react';

const URL_BASE = 'http://localhost:8000';

function RelatorioProdutos({ token, onVoltar }) {
  const [relatorio, setRelatorio] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Estados para os filtros de data (Igual ao Histórico)
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const buscarRelatorio = async () => {
      try {
        setCarregando(true);
        setErro('');

        // Montagem da URL com Query Params
        let url = `${URL_BASE}/produtos/relatorio`;
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
          // Se a API retornar 404 (Nenhum produto vendido), limpamos a lista
          setRelatorio([]);
          if (response.status !== 404) {
            setErro(data.detail || 'Erro ao carregar relatório.');
          }
          return;
        }

        setRelatorio(data);
      } catch (error) {
        setErro('Erro de conexão com o servidor.');
        setRelatorio([]);
      } finally {
        setCarregando(false);
      }
    };

    buscarRelatorio();
  }, [token, dataInicio, dataFim]); // Atualiza sozinho quando as datas mudam

  // Calcula o valor total do período filtrado
  const totalGeral = relatorio.reduce((acc, item) => acc + item.valor_vendido, 0);

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
        <h2 style={{ margin: 0, color: '#333' }}>📊 Relatório de Produtos</h2>
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

        <button 
          onClick={() => { setDataInicio(''); setDataFim(new Date().toISOString().split('T')[0]); }}
          style={{ 
            marginTop: '20px',
            padding: '8px 12px', 
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

      {/* --- TABELA DE RESULTADOS --- */}
      <div>
        {carregando ? (
          <p style={{ textAlign: 'center', fontSize: '18px' }}>Carregando relatório...</p>
        ) : erro ? (
          <p style={{ color: 'red', textAlign: 'center', fontWeight: 'bold' }}>{erro}</p>
        ) : relatorio.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', marginTop: '40px', fontSize: '18px' }}>
            Nenhum produto vendido neste período.
          </p>
        ) : (
          <div style={{ backgroundColor: 'white', borderRadius: '10px', padding: '20px', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '12px' }}>ID</th>
                  <th style={{ padding: '12px' }}>Produto</th>
                  <th style={{ padding: '12px' }}>Preço Unit.</th>
                  <th style={{ padding: '12px' }}>Qtd. Vendida</th>
                  <th style={{ padding: '12px' }}>Total Arrecadado</th>
                </tr>
              </thead>
              <tbody>
                {relatorio.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px', color: '#666' }}>#{item.id}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#333' }}>{item.nome}</td>
                    <td style={{ padding: '12px' }}>R$ {item.preco.toFixed(2)}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ fontWeight: 'bold' }}>{item.qnt_vendida}</span> un.
                    </td>
                    <td style={{ padding: '12px', color: '#28a745', fontWeight: 'bold' }}>
                      R$ {item.valor_vendido.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', fontSize: '18px' }}>
                  <td colSpan="4" style={{ padding: '15px', textAlign: 'right' }}>Receita Total do Período:</td>
                  <td style={{ padding: '15px', color: '#28a745' }}>R$ {totalGeral.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default RelatorioProdutos;