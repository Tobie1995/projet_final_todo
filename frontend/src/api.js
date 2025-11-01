// src/api.js
// Ce fichier contient toutes les fonctions de communication avec l'API pour les tâches.

export async function fetchTaches() {
  const response = await fetch('http://127.0.0.1:8000/taches/taches/');
  if (!response.ok) throw new Error('Erreur lors de la récupération des tâches');
  return response.json();
}

export async function handleAjoutTache(nouvelleTache) {
  const response = await fetch('http://127.0.0.1:8000/taches/taches/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(nouvelleTache),
  });
  if (!response.ok) throw new Error('Erreur lors de l\'ajout de la tâche');
  return response.json();
}

export async function handleSupprimeTache(id) {
  const response = await fetch(`http://127.0.0.1:8000/taches/taches/${id}/`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Erreur lors de la suppression de la tâche');
  return true;
}

export async function handleToggleTache(id, done) {
  const response = await fetch(`http://127.0.0.1:8000/taches/taches/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ done }),
  });
  if (!response.ok) throw new Error('Erreur lors du changement d\'état de la tâche');
  return response.json();
}
