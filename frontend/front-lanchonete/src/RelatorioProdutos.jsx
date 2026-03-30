import { useEffect, useState } from 'react';

const URL_BASE = 'http://localhost:8000';

function RelatorioProdutos({ token, onVoltar }) {
  const [relatorio, setRelatorio] = useState([]);
  const [mensagem, setMensagem] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const buscarRelatorio = async () => {
      try {
        const response = await fetch(`${URL_BASE}/produtos/relatorio`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // O backend retorna 204 quando não há vendas. Precisamos tratar antes do .json()
        if (response.status === 204) {
          setRelatorio([]);
          setMensagem('Nenhum produto com venda registrada ainda.');
          setCarregando(false);
          return;
        }

        const data = await response.json();

        if (response.ok) {
          setRelatorio(data);
        } else {
          setMensagem(`❌ ${data.detail || 'Erro ao carregar relatório.'}`);
        }
      } catch (error) {
        setMensagem('❌ Erro de conexão com o servidor.');
      } finally {
        setCarregando(false);
      }
    };

    buscarRelatorio();
  }, [token]);

  // Calcula o valor total de todas as vendas juntas
  const totalGeral = relatorio.reduce((acc, item) => acc + item.valor_vendido, 0);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f4f4f9', minHeight: '100vh' }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid #ddd',
          paddingBottom: '15px',
          marginBottom: '20px'
        }}
      >
        <h2 style={{ margin: 0, color: '#333' }}>📊 Relatório de Produtos</h2>
        <button
          onClick={onVoltar}
          style={{
            padding: '8px 15px',
            cursor: 'pointer',
            backgroundColor: '#007BFF',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontWeight: 'bold'
          }}
        >
          Voltar
        </button>
      </header>

      {carregando ? (
        <p>Carregando relatório...</p>
      ) : mensagem ? (
        <p style={{ fontSize: '18px', color: '#666', textAlign: 'center', marginTop: '50px' }}>{mensagem}</p>
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
                  <td style={{ padding: '12px' }}>{item.qnt_vendida} un.</td>
                  <td style={{ padding: '12px', color: 'green', fontWeight: 'bold' }}>
                    R$ {item.valor_vendido.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#e9ecef', fontWeight: 'bold', fontSize: '18px' }}>
                <td colSpan="4" style={{ padding: '15px', textAlign: 'right' }}>Receita Total:</td>
                <td style={{ padding: '15px', color: '#28a745' }}>R$ {totalGeral.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

export default RelatorioProdutos;