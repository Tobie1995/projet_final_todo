
import React from "react";
import TacheItem from "./TacheItem";

export default function TacheListe({ taches, error, handleSupprimeTache, handleToggleTache, handleUpdateTache, onSuccess }) {
  // Si onSuccess est passé, cela signifie que c'est le composant de connexion
  if (onSuccess) {
    const handleLogin = () => {
      fetch('http://127.0.0.1:8000/taches/api/liste/', {
        method: 'GET',
        credentials: 'include',
      })
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`Erreur ${res.status}: ${res.statusText}`)
          }
          return res.json()
        })
        .then(() => {
          onSuccess()
        })
        .catch((err) => {
          console.error('Erreur de connexion:', err)
          window.location.href = 'http://127.0.0.1:8000/admin'
        })
    }

    return (
      <div>
        <p>Veuillez vous connecter</p>
        <button onClick={handleLogin}>Se connecter</button>
      </div>
    )
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div>
        <p style={{ color: 'red' }}>Erreur: {error}</p>
        <p>Assurez-vous d'être connecté à Django Admin</p>
        <a href="http://127.0.0.1:8000/admin" target="_blank" rel="noopener noreferrer">
          Se connecter
        </a>
      </div>
    )
  }

  // Affichage de la liste des tâches
  return (
    <div className="tache-liste">
      <h2>Liste des tâches</h2>
      <ul className="tache-items">
        {taches.map((tache) => {
          const key = tache.id || tache.pk;
          if (!key) {
            console.warn('Tâche sans clé unique !', tache);
          }
          return (
            <TacheItem
              key={key}
              tache={tache}
              handleSupprimeTache={handleSupprimeTache}
              handleToggleTache={handleToggleTache}
              handleUpdateTache={handleUpdateTache}
            />
          );
        })}
      </ul>
    </div>
  );
}

