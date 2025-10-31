import { useEffect, useState } from 'react'

export default function TacheListeSimple() {
  const [taches, setTaches] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('http://127.0.0.1:8000/taches/api/liste/', {
      method: 'GET',
      credentials: 'include', // Important pour les sessions Django
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`Erreur ${res.status}: ${res.statusText}`)
        }
        return res.json()
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setTaches(data)
        } else if (Array.isArray(data?.results)) {
          setTaches(data.results)
        } else if (Array.isArray(data?.taches)) {
          setTaches(data.taches)
        } else {
          setTaches([])
        }
      })
      .catch((err) => {
        setError(err.message)
        setTaches([])
      })
  }, [])

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