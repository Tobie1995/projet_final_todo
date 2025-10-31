import React, { useState } from 'react';

function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Fonction utilitaire pour récupérer le token CSRF dans les cookies
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const csrftoken = getCookie('csrftoken');
      const response = await fetch('http://127.0.0.1:8000/taches/api-auth/login/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-CSRFToken': csrftoken,
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      });
      if (response.ok) {
        setError('');
        setUsername('');
        setPassword('');
        if (onLogin) onLogin();
      } else {
        setError('Identifiants invalides ou erreur serveur');
      }
    } catch (err) {
      setError('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
      <h3>Connexion</h3>
      <div>
        <input
          type="text"
          placeholder="Nom d'utilisateur"
          value={username}
          onChange={e => setUsername(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={e => setPassword(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Connexion...' : 'Se connecter'}
      </button>
      {error && <div style={{ color: 'red', marginTop: 10 }}>{error}</div>}
    </form>
  );
}

export default LoginForm;
