import './App.css'
import { useEffect, useState } from 'react'
import TacheListe from './components/TacheListe'
import AjoutTacheForm from './components/AjoutTacheForm'
// ...existing code...
import { fetchTaches, handleAjoutTache, handleSupprimeTache, handleToggleTache } from './api'

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
  // Suppression de l'état d'authentification
  const [isLoading, setIsLoading] = useState(true)

  // Fonction pour récupérer les tâches
  const fetchTachesCallback = async () => {
    try {
      const data = await fetchTaches();
      if (Array.isArray(data)) {
        setTaches(data);
      } else if (Array.isArray(data?.results)) {
        setTaches(data.results);
      } else if (Array.isArray(data?.taches)) {
        setTaches(data.taches);
      } else {
        setTaches([]);
      }
      setError('');
    } catch (err) {
      setError(err.message);
      setTaches([]);
    }
  }

  useEffect(() => {
    setIsLoading(true);
    fetchTachesCallback().finally(() => setIsLoading(false));
  }, []);

  // Fonction pour ajouter une tâche
  const handleAjoutTacheCallback = async (titre) => {
    try {
      const nouvelleTache = await handleAjoutTache({ titre });
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
      await handleSupprimeTache(id);
      setTaches(prevTaches => prevTaches.filter(tache => tache.id !== id));
      setSuccessMsg('Tâche supprimée avec succès !');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setSuccessMsg('');
      setError(err.message);
    }
  };

  // Fonction pour mettre à jour l'état terminee d'une tâche
  const handleToggleTacheCallback = async (id, termine) => {
    try {
      const updatedTache = await handleToggleTache(id, !termine);
      setTaches(prevTaches => prevTaches.map(tache =>
        tache.id === id ? { ...tache, termine: updatedTache.termine } : tache
      ));
    } catch (err) {
      setError(err.message);
    }
  };

  // Fonction pour mettre à jour une tâche (ex: titre)
  const handleUpdateTache = async (id, updatedFields) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/taches/taches/${id}/`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields)
      });
      let errorText = '';
      if (!response.ok) {
        errorText = await response.text();
        console.error('Erreur PATCH:', errorText);
        throw new Error(`Erreur ${response.status}: ${response.statusText} - ${errorText}`);
      }
      const updatedTache = await response.json();
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
      </header>
      <main className="app-main">
        {isLoading ? (
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
              handleUpdateTache={handleUpdateTache}
            />
          </>
        )}
      </main>
    </div>
  )
}

export default App