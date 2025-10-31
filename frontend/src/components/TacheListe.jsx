export default function TacheListe({ taches, error, onSuccess }) {
  // Si onSuccess est passé, cela signifie que c'est le composant de connexion
  if (onSuccess) {
    const handleLogin = () => {
      // Votre logique de connexion existante
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
          const t = 'TOBIE' 
          localStorage.setItem('authToken', t)
          onSuccess(t)
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
    <div>
      <h3>Liste des tâches</h3>
      <ul>
        {taches.map((tache, index) => {
          const key = tache.id ?? tache.pk ?? index
          const label = tache.titre ?? tache.nom ?? tache.name ?? tache.description ?? String(key)
          return <li key={key}>{label}</li>
        })}
      </ul>
    </div>
  )
}

