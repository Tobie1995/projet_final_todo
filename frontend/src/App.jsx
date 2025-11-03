  // -------------------- IMPORTS EN HAUT DU FICHIER --------------------
  import './App.css';
  import { useEffect, useState } from 'react';
  import TacheListe from './components/TacheListe';
  import AjoutTacheForm from './components/AjoutTacheForm';
  import LoginPage from './components/LoginPage';
  import { fetchTaches, handleAjoutTache, handleSupprimeTache, handleToggleTache, handleUpdateTache, storeTokenFromLogin } from './api';

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

function App() {
  const [taches, setTaches] = useState([])
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  // Ajout de l'état token pour l'authentification
  const [token, setToken] = useState(() => {
    // On tente de lire le token depuis le localStorage au chargement
    return localStorage.getItem('token') || '';
  });
    // Ajout de l'état isLoading
    const [isLoading, setIsLoading] = useState(false);

  // Fonction de connexion
  const handleLogin = async (username, password) => {
    try {
      const token = await storeTokenFromLogin(username, password);
      setToken(token);
    } catch (err) {
      alert('Erreur de connexion : ' + err.message);
    }
  };
  // Fonction de déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };
    // Fonction pour récupérer les tâches
    const fetchTachesCallback = async () => {
      try {
        const tachesData = await fetchTaches();
        setTaches(tachesData);
        setError('');
      } catch (err) {
        setError('Erreur lors du chargement des tâches : ' + err.message);
      }
    };
    useEffect(() => {
      if (!token) return;
      setIsLoading(true);
      fetchTachesCallback().finally(() => setIsLoading(false));
    }, [token]);

  // Fonction pour ajouter une tâche
  const handleAjoutTacheCallback = async (titre) => {
    try {
      const nouvelleTache = await handleAjoutTache({ titre }, token);
      setTaches(prevTaches => [...prevTaches, nouvelleTache]);
      setSuccessMsg('Tâche ajoutée avec succès !');
      setTimeout(() => setSuccessMsg(''), 3000);
      return nouvelleTache;
    } catch (err) {
      setSuccessMsg('');
      throw err;
    }
  };

  // Fonction pour supprimer une tâche
  const handleSupprimeTacheCallback = async (id) => {
    try {
      await handleSupprimeTache(id, token);
      setTaches(prevTaches => prevTaches.filter(tache => tache.id !== id));
      setSuccessMsg('Tâche supprimée avec succès !');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setSuccessMsg('');
      setError(err.message);
    }
  };

  // Fonction pour mettre à jour l'état terminee d'une tâche
  const handleToggleTacheCallback = async (id, done) => {
    try {
      const updatedTache = await handleToggleTache(id, !done, token);
      setTaches(prevTaches => prevTaches.map(tache =>
        tache.id === id ? { ...tache, done: updatedTache.done } : tache
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  // Fonction pour mettre à jour une tâche (ex: titre)
  const handleUpdateTacheCallback = async (id, updatedFields) => {
    try {
      const updatedTache = await handleUpdateTache(id, updatedFields, token);
      setTaches(prevTaches => prevTaches.map(tache =>
        tache.id === id ? { ...tache, ...updatedTache } : tache
      ));
      setSuccessMsg('Tâche mise à jour avec succès !');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setSuccessMsg('');
      setError(err.message);
      alert('Erreur lors de la modification : ' + err.message);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Ma Liste de Tâches</h1>
        {(token && token !== '') && (
          <button onClick={handleLogout} style={{ marginLeft: 20 }}>Déconnexion</button>
        )}
      </header>
  <main className="app-main" style={{ maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '2em 1em' }}>
        {(!token || token === '') ? (
          <LoginPage handleLogin={handleLogin} />
        ) : (
          isLoading ? (
            <div className="loading">Chargement...</div>
          ) : (
            <>
              {successMsg && <div style={{ color: 'green', marginBottom: 10 }}>{successMsg}</div>}
              <AjoutTacheForm onAjoutTache={handleAjoutTacheCallback} />
              <TacheListe
                taches={taches}
                error={error}
                handleSupprimeTache={handleSupprimeTacheCallback}
                handleToggleTache={handleToggleTacheCallback}
                handleUpdateTache={handleUpdateTacheCallback}
              />
            </>
          )
        )}
      </main>
    </div>
  )
}

export default App;