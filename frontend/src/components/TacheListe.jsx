
import React, { useState, useEffect, useRef } from "react";
import TacheItem from "./TacheItem";

export default function TacheListe({ taches, error, handleSupprimeTache, handleToggleTache, handleUpdateTache, onSuccess }) {
  // --- Logique rapport Celery ---
  const [reportTaskId, setReportTaskId] = useState(null);
  const [reportStatus, setReportStatus] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!reportTaskId) return;
    intervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/taches/check-report-status/${reportTaskId}/`, {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) throw new Error("Erreur lors de la vérification du statut");
        const data = await res.json();
        setReportStatus(`${data.state}${data.result ? ` : ${data.result}` : ""}`);
        if (data.state === "SUCCESS" || data.state === "FAILURE") {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } catch (err) {
        setReportStatus("Erreur : " + err.message);
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 3000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [reportTaskId]);

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
        {/* Bouton Générer un Rapport et affichage du statut */}
        <button
          onClick={async () => {
            try {
              const res = await fetch("http://127.0.0.1:8000/taches/start-report/", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
              });
              if (!res.ok) throw new Error("Erreur lors du démarrage du rapport");
              const data = await res.json();
              setReportTaskId(data.task_id);
              setReportStatus("En attente...");
            } catch (err) {
              setReportStatus("Erreur : " + err.message);
            }
          }}
          disabled={!!reportTaskId && reportStatus !== "SUCCESS" && reportStatus !== "FAILURE"}
        >
          Générer un Rapport
        </button>
        <div style={{ marginTop: "1em" }}>
          <strong>Statut du rapport :</strong> {reportStatus}
        </div>
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