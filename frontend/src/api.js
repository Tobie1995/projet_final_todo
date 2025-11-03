
// 1. Fonction utilitaire pour récupérer le token CSRF dans les cookies
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

// 2. Fonction de login utilisateur (requête brute)
// Nouvelle fonction de login utilisateur via JWT
export async function loginUser(username, password) {
  const response = await fetch('http://127.0.0.1:8000/api/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });
  return response;
}

// 3. Fonction pour effectuer le login et stocker le token JWT
export async function storeTokenFromLogin(username, password) {
  const response = await loginUser(username, password);
  if (!response.ok) throw new Error('Identifiants invalides ou erreur serveur');
  const data = await response.json();
  // Selon la réponse, le token peut être dans data.access ou data.token
  const token = data.access || data.token;
  if (token) {
    localStorage.setItem('token', token);
    return token;
  } else {
    throw new Error('Token JWT non trouvé dans la réponse');
  }
}


// 4. Fonctions liées aux tâches
export async function fetchTaches() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://127.0.0.1:8000/taches/taches/', {
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
  if (!response.ok) throw new Error('Erreur lors de la récupération des tâches');
  return response.json();
}

export async function handleAjoutTache(nouvelleTache) {
  const token = localStorage.getItem('token');
  const response = await fetch('http://127.0.0.1:8000/taches/taches/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(nouvelleTache),
  });
  if (!response.ok) throw new Error('Erreur lors de l\'ajout de la tâche');
  return response.json();
}

export async function handleSupprimeTache(id) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://127.0.0.1:8000/taches/taches/${id}/`, {
    method: 'DELETE',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
    },
  });
  if (!response.ok) throw new Error('Erreur lors de la suppression de la tâche');
  return true;
}

export async function handleToggleTache(id, done) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://127.0.0.1:8000/taches/taches/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify({ done }),
  });
  if (!response.ok) throw new Error('Erreur lors du changement d\'état de la tâche');
  return response.json();
}

// Nouvelle fonction pour mettre à jour une tâche (ex: titre, etc.)
export async function handleUpdateTache(id, updatedFields) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://127.0.0.1:8000/taches/taches/${id}/`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    },
    body: JSON.stringify(updatedFields)
  });
  let errorText = '';
  if (!response.ok) {
    errorText = await response.text();
    console.error('Erreur PATCH:', errorText);
    throw new Error(`Erreur ${response.status}: ${response.statusText} - ${errorText}`);
  }
  return response.json();
}

// 5. Fonctions liées au rapport Celery
export async function checkReportStatus(reportTaskId) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://127.0.0.1:8000/taches/check-report-status/${reportTaskId}/`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Erreur lors de la vérification du statut');
  return response.json();
}

export async function startReport() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://127.0.0.1:8000/taches/start-report/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error('Erreur lors du démarrage du rapport');
  return response.json();
}

// 6. Récupérer la liste des tâches (pour le bouton de connexion)
export async function getListeTaches() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://127.0.0.1:8000/taches/api/liste/', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Erreur ${response.status}: ${response.statusText}`);
  return response.json();
}
