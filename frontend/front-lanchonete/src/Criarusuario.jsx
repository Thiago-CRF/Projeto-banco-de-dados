import { useState } from 'react';

const URL_BASE = 'http://localhost:8000';

function CriarUsuario({ token, onVoltar }) {
  const [username, setUsername] = useState('');
  const [cargo, setCargo] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleCriarUsuario = async (e) => {
    e.preventDefault();
    setMensagem('');

    try {
      const response = await fetch(`${URL_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username,
          cargo,
          senha
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(`✅ Usuário criado com sucesso! ID: ${data.id_usuario}`);
        setUsername('');
        setCargo('');
        setSenha('');
      } else {
        setMensagem(`❌ ${data.detail || 'Erro ao criar usuário.'}`);
      }
    } catch (error) {
      setMensagem('❌ Erro de conexão com o servidor.');
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
        <h2>Criar Usuário</h2>

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

      <form
        onSubmit={handleCriarUsuario}
        style={{
          maxWidth: '400px',
          marginTop: '30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}
      >
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
        />

        <select
          value={cargo}
          onChange={(e) => setCargo(e.target.value)}
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
        >
          <option value="">Selecione o cargo</option>
          <option value="gerente">Gerente</option>
          <option value="vendedor">Vendedor</option>
        </select>

        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          style={{
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px'
          }}
        />

        <button
          type="submit"
          style={{
            padding: '12px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Criar Usuário
        </button>
      </form>

      {mensagem && (
        <p
          style={{
            marginTop: '20px',
            fontWeight: 'bold'
          }}
        >
          {mensagem}
        </p>
      )}
    </div>
  );
}

export default CriarUsuario;