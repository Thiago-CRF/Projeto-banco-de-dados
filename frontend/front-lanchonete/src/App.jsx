import { useState } from 'react';
import './index.css';

function App() {
  // 1. estados de memória da tela
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');

  // 2. função de login. O que acontece ao clicar em "Entrar"
  const handleLogin = async (e) => {
    e.preventDefault(); // Impede o navegador de recarregar a página (comportamento padrão do HTML)
    setErro(''); // Limpa qualquer mensagem de erro anterior

    try {
      /* ⚠️ ATENÇÃO AQUI: O seu backend FastAPI usa OAuth2PasswordRequestForm.
        Isso significa que ele NÃO aceita JSON no login. Ele exige dados de formulário
        (application/x-www-form-urlencoded). Por isso usamos o URLSearchParams!
      */
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      // Faz a requisição para o seu backend
      const response = await fetch('http://localhost:8000/login', { // mudar o URL quando no ar
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      // Se a resposta não for "ok" (ex: erro 401 de senha errada), lançamos um erro
      if (!response.ok) {
        throw new Error('Usuário ou senha incorretos!');
      }

      // Converte a resposta de sucesso para JSON
      const data = await response.json();

      // 3. SUCESSO: Salva o token na "memória do navegador" (LocalStorage)
      localStorage.setItem('token', data.access_token);

      alert('Login realizado com sucesso! Token salvo.');
      console.log('Token:', data.access_token); // Mostra o token no terminal do navegador
      
      // (No próximo passo, faremos o redirecionamento para a tela do Caixa aqui)

    } catch (error) {
      // Se algo der errado, salvamos o erro no estado para mostrar na tela
      setErro(error.message);
    }
  };

  // 4. O VISUAL (JSX): O que vai aparecer na tela
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h2>Login - Sistema da Lanchonete</h2>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
        
        {/* Campo de Usuário */}
        <input
          type="text"
          placeholder="Nome de Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)} // atualiza o estado a cada letra digitada (onChange)
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        
        {/* Campo de Senha */}
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)} // atualiza o estado a cada letra digitada (onChange)
          required
          style={{ padding: '10px', fontSize: '16px' }}
        />
        
        {/* Botão de Enviar */}
        <button type="submit" style={{ padding: '10px', fontSize: '16px', cursor: 'pointer' }}>
          Entrar
        </button>
      </form>

      {/* Se a variável 'erro' tiver algum texto, mostra este parágrafo em vermelho */}
      {erro && <p style={{ color: 'red', fontWeight: 'bold' }}>{erro}</p>}
    </div>
  );
}

export default App;