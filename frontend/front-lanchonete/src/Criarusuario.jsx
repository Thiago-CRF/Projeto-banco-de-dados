import { useState } from 'react';

import { URL_BASE } from './constants'; // import do link da api

function CriarUsuario({ token, onVoltar }) {
  const [email, setEmail] = useState('');
  const [cargo, setCargo] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const handleCriarUsuario = async (e) => {
    e.preventDefault();
    setMensagem('');

    // Validação personalizada de E-mail usando Regex
    // Verifica se tem texto, uma "@", mais texto, um ponto ".", e mais texto no fim.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      setMensagem('❌ Digite um email válido para criar conta.');
      return; // O "return" faz a função parar aqui mesmo e não envia para a API
    }

    try {
      const response = await fetch(`${URL_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          username: email, 
          cargo,
          senha
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMensagem(`✅ Usuário criado com sucesso! ID: ${data.id_usuario}`);
        setEmail('');
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
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f4f4f9', 
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
        position: 'relative' 
      }}>
        
        <button
          onClick={onVoltar}
          style={{
            position: 'absolute',
            top: '15px',
            left: '15px',
            padding: '6px 12px',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            color: '#007BFF',
            border: '1px solid #007BFF',
            borderRadius: '5px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          ← Voltar
        </button>

        <h2 style={{ textAlign: 'center', marginTop: '15px', marginBottom: '25px', color: '#333' }}>
          {/* Adicionamos o emoji em um span com display block para garantir que quebre a linha */}
          <span style={{ display: 'block', fontSize: '40px', marginBottom: '10px' }}>
            👤
          </span>
          Criar Usuário
        </h2>

        {/* Adicionamos noValidate para impedir o balãozinho padrão do navegador */}
        <form
          onSubmit={handleCriarUsuario}
          noValidate 
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}
        >
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          />

          <select
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
            required
            style={{
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '16px',
              backgroundColor: 'white'
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
              padding: '12px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              fontSize: '16px'
            }}
          />

          <button
            type="submit"
            style={{
              padding: '14px',
              backgroundColor: '#007BFF',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              marginTop: '10px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0063ce'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#007BFF'}
          >
            Criar Conta
          </button>
        </form>

        {mensagem && (
          <p
            style={{
              marginTop: '20px',
              textAlign: 'center',
              fontWeight: 'bold',
              color: mensagem.includes('✅') ? '#155724' : '#721c24',
              padding: '10px',
              backgroundColor: mensagem.includes('✅') ? '#d4edda' : '#f8d7da',
              borderRadius: '5px',
              border: `1px solid ${mensagem.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
            }}
          >
            {mensagem}
          </p>
        )}
      </div>
    </div>
  );
}

export default CriarUsuario;