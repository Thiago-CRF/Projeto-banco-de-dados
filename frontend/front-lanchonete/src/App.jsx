import { useState } from 'react';
import Caixa from './Caixa'; 
import './index.css';

import { URL_BASE } from './constants'; // import do link da api

function App() {
  // Mudamos visualmente para 'email', mas enviamos como 'username' para a API
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Estado para controlar o efeito hover do botão (JS inline)
  const [btnHover, setBtnHover] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const formData = new URLSearchParams();
      // O backend do FastAPI/OAuth2 exige que a chave seja "username"
      formData.append('username', email); 
      formData.append('password', password);

      const response = await fetch(`${URL_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      if (!response.ok) throw new Error('E-mail ou senha incorretos!');

      const data = await response.json();

      localStorage.setItem('token', data.access_token);
      setToken(data.access_token); 

    } catch (error) {
      setErro(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // Se o usuário estiver logado, mostra a tela do Caixa
  if (token) {
    return <Caixa token={token} onLogout={handleLogout} />;
  }

  // Se NÃO estiver logado, mostra a tela de Login com o novo visual
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh', // Ocupa a altura toda da tela
      backgroundColor: '#f4f4f9', // Cor de fundo suave igual a Criar Usuário
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      {/* O "Cartão" de Login */}
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', // Sombra leve
        width: '100%',
        maxWidth: '400px' // Largura máxima do cartão
      }}>
        
        <h2 style={{ 
          textAlign: 'center', 
          marginTop: 0, 
          marginBottom: '30px', 
          color: '#333',
          fontSize: '28px'
        }}>
          Login - Lanchonete
        </h2>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <input 
            type="text" // type text pra receber contas especiais ainda (como admin)
            placeholder="E-mail" // visualmente pede E-mail
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
          
          <input 
            type="password" 
            placeholder="Senha" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
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
              backgroundColor: btnHover ? '#0063ce' : '#007BFF', // Efeito hover roxo
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '16px',
              marginTop: '10px',
              transition: 'background-color 0.2s' // Animação suave da cor
            }}
            onMouseOver={() => setBtnHover(true)}
            onMouseOut={() => setBtnHover(false)}
          >
            Entrar
          </button>
        </form>

        {/* Mensagem de erro estilizada em vermelho igual a Criar Usuário */}
        {erro && (
          <p style={{ 
            color: '#721c24', 
            fontWeight: 'bold', 
            textAlign: 'center',
            marginTop: '20px',
            padding: '10px',
            backgroundColor: '#f8d7da',
            borderRadius: '5px',
            border: '1px solid #f5c6cb'
          }}>
            ❌ {erro}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;