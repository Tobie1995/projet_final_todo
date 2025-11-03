
import React, { useState } from 'react';

const LoginPage = ({ handleLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (handleLogin) {
      await handleLogin(username, password);
    }
  };

  return (
    <div className="login-page" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(120deg, #2193b0 0%, #6dd5ed 100%)',
    }}>
      <form onSubmit={handleSubmit} style={{
        background: '#fff',
        padding: '2.5em 2em',
        borderRadius: '16px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
        minWidth: '320px',
        maxWidth: '350px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.2em',
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '0.5em',
          color: '#2193b0',
          fontWeight: 700,
          letterSpacing: '1px',
        }}>Connexion</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
          <label htmlFor="username" style={{ fontWeight: 500 }}>Nom d'utilisateur :</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{
              padding: '0.7em',
              borderRadius: '8px',
              border: '1px solid #eee',
              fontSize: '1em',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em' }}>
          <label htmlFor="password" style={{ fontWeight: 500 }}>Mot de passe :</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: '0.7em',
              borderRadius: '8px',
              border: '1px solid #eee',
              fontSize: '1em',
              outline: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
            }}
          />
        </div>
        <button type="submit" style={{
          background: 'linear-gradient(120deg, #2193b0 0%, #6dd5ed 100%)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          padding: '0.8em',
          fontWeight: 600,
          fontSize: '1.1em',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(33,147,176,0.13)',
          transition: 'background 0.2s',
        }}>Se connecter</button>
      </form>
    </div>
  );
};

export default LoginPage;
