import './App.css'
import { useEffect, useState } from 'react'
import TacheListe from './components/TacheListe'
import AjoutTacheForm from './components/AjoutTacheForm'

function App() {
  const [token, setToken] = useState('')
  const [taches, setTaches] = useState([])
  const [error, setError] = useState('')

  // Récupération du token
  useEffect(() => {
    const t = localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || ''
    setToken(t)
  }, [])

  // Fonction pour récupérer les tâches
  const fetchTaches = () => {
    if (token) {
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
          setError('')
        })
        .catch((err) => {
          setError(err.message)
          setTaches([])
        })
    }
  }

  // Récupération des tâches au chargement et quand le token change
  useEffect(() => {
    fetchTaches()
  }, [token])
  const authToken = token;

  // Fonction pour ajouter une tâche
const handleAjoutTache = async (titre) => {
  try {
    const response = await fetch('http://127.0.0.1:8000/taches/taches/', {
      method: 'POST',
      credentials: 'include', // Utilise les cookies de session
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        titre: titre,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const nouvelleTache = await response.json();
    
    // Mettre à jour l'état en ajoutant la nouvelle tâche à la liste existante
    setTaches(prevTaches => [...prevTaches, nouvelleTache]);
    
    console.log('Tâche ajoutée avec succès:', nouvelleTache);
    return nouvelleTache;
    
  } catch (err) {
    console.log( err.message);
    throw err;
  }
};

  if (!token) {
    return (
      <div>
        <h1>Ma Liste de Tâches</h1>
        <TacheListe onSuccess={(t) => setToken(t)} />
      </div>
    )
  }

  return (
    <div >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1>Ma Liste de Tâches</h1>
      </div>
      <AjoutTacheForm onAjoutTache={handleAjoutTache} />
      <TacheListe taches={taches} error={error} />
    </div>
  )
}

export default App