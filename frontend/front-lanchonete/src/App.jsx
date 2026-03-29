import { useState } from 'react';
import Caixa from './Caixa'; // Importamos a tela nova que acabamos de criar!
import './index.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  
  // NOVO ESTADO: Ele já começa tentando ler o token do LocalStorage
  const [token, setToken] = useState(localStorage.getItem('token'));

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const response = await fetch('http://localhost:8000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });

      if (!response.ok) throw new Error('Usuário ou senha incorretos!');

      const data = await response.json();

      localStorage.setItem('token', data.access_token);
      setToken(data.access_token); // NOVO: Atualiza a memória com o token, forçando a tela a mudar!

    } catch (error) {
      setErro(error.message);
    }
  };

  // NOVO: Função para deslogar (apaga o token do navegador e da memória)
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  // RENDERIZAÇÃO CONDICIONAL: 
  // Se a variável 'token' existir (usuário logado), mostre o <Caixa />
  if (token) {
    return <Caixa token={token} onLogout={handleLogout} />;
  }

  // Se o código chegou até aqui (não tem token), mostre a tela de login
  // 4. O VISUAL (JSX): O que vai aparecer na tela
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h2>Login - Sistema da Lanchonete</h2>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
        
        <input 
        type="text" 
        placeholder="Nome de Usuário" 
        value={username} 
        onChange={(e) => setUsername(e.target.value)} // atualiza o estado a cada letra digitada (onChange)
        required 
        style={{ padding: '10px' }} 
        />
        
        <input 
        type="password" 
        placeholder="Senha" 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} // atualiza o estado a cada letra digitada (onChange)
        required 
        style={{ padding: '10px' }} 
        />
        
        <button type="submit" style={{ padding: '10px', cursor: 'pointer' }}>Entrar</button>
      </form>

      {/* Se a variável 'erro' tiver algum texto, mostra este parágrafo em vermelho */}
      {erro && <p style={{ color: 'red', fontWeight: 'bold' }}>{erro}</p>}
    </div>
  );
}

export default App;