
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { checkReportStatus, startReport, getListeTaches } from "../api";
import TacheItem from "./TacheItem";

export default function TacheListe({ taches, error, handleSupprimeTache, handleToggleTache, handleUpdateTache, onSuccess }) {
  const navigate = useNavigate();
  // Sélection multiple
  const [selectedIds, setSelectedIds] = useState([]);

  // Sélectionner/désélectionner une tâche
  const handleSelectTache = (id, checked) => {
    setSelectedIds(prev => checked ? [...prev, id] : prev.filter(_id => _id !== id));
  };

  // Sélectionner/désélectionner toutes les tâches
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(taches.map(t => t.id || t.pk));
    } else {
      setSelectedIds([]);
    }
  };

  // Suppression groupée
  const token = localStorage.getItem('token');
  const handleDeleteSelected = async () => {
    for (const id of selectedIds) {
      await handleSupprimeTache(id, token);
    }
    setSelectedIds([]);
  };
  // --- Logique rapport Celery ---
  const [reportTaskId, setReportTaskId] = useState(null);
  const [reportStatus, setReportStatus] = useState("");
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!reportTaskId) return;
    intervalRef.current = setInterval(async () => {
      try {
        const data = await checkReportStatus(reportTaskId, token);
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
  }, [reportTaskId, token]);

  // Si onSuccess est passé, cela signifie que c'est le composant de connexion
  if (onSuccess) {
    const handleLogin = async () => {
      try {
        await getListeTaches(token);
        onSuccess();
      } catch (err) {
        console.error('Erreur de connexion:', err);
        window.location.href = 'http://127.0.0.1:8000/admin';
      }
    };
    return (
      <div>
        <p>Veuillez vous connecter</p>
        <button onClick={handleLogin}>Se connecter</button>
      </div>
    )
  }

  // Affichage des erreurs avec redirection automatique vers /login
  if (error) {
    useEffect(() => {
      navigate('/login');
    }, [navigate]);
    return null;
  }

  // Affichage de la liste des tâches
  return (
    <div className="tache-liste" style={{ maxWidth: '900px', width: '100%', margin: '0 auto', padding: '2em 1em' }}>
      {/* Bouton Générer un Rapport et affichage du statut */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1em', marginBottom: '2em' }}>
        <button
          onClick={async () => {
            try {
              const data = await startReport(token);
              setReportTaskId(data.task_id);
              setReportStatus("En attente...");
            } catch (err) {
              setReportStatus("Erreur : " + err.message);
            }
          }}
          disabled={!!reportTaskId && reportStatus !== "SUCCESS" && reportStatus !== "FAILURE"}
          style={{
            background: 'linear-gradient(120deg, #2193b0 0%, #6dd5ed 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.8em 2em',
            fontWeight: 600,
            fontSize: '1.1em',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(33,147,176,0.13)',
            transition: 'background 0.2s',
            marginBottom: '0.5em',
          }}
        >
          Générer un Rapport
        </button>
        <div style={{
          background: '#e3f2fd',
          color: '#1565c0',
          borderRadius: '8px',
          padding: '0.7em 1.2em',
          fontWeight: 500,
          boxShadow: '0 1px 4px rgba(33,147,176,0.07)',
          minWidth: '220px',
          textAlign: 'center',
        }}>
          <strong>Statut du rapport :</strong> {reportStatus}
        </div>
      </div>

      {/* Sélection groupée et suppression  */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.2em',
        background: '#f5fafd',
        borderRadius: '8px',
        padding: '1em 1.5em',
        boxShadow: '0 1px 4px rgba(33,147,176,0.07)',
        margin: '1em 0 2em 0',
        flexWrap: 'wrap',
      }}>
        <input
          type="checkbox"
          checked={selectedIds.length === taches.length && taches.length > 0}
          onChange={e => handleSelectAll(e.target.checked)}
          style={{ width: 20, height: 20, accentColor: '#2193b0' }}
        />
        <span style={{ fontWeight: 500, color: '#1565c0' }}>Tout sélectionner</span>
        <button
          style={{
            background: selectedIds.length === 0
              ? 'linear-gradient(120deg, #ef9a9a 0%, #e57373 100%)'
              : 'linear-gradient(120deg, #e53935 0%, #ef5350 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '0.7em 1.5em',
            fontWeight: 600,
            fontSize: '1em',
            boxShadow: '0 2px 8px rgba(229,57,53,0.13)',
            cursor: selectedIds.length === 0 ? 'not-allowed' : 'pointer',
            opacity: selectedIds.length === 0 ? 0.6 : 1,
            transition: 'background 0.2s',
          }}
          onClick={handleDeleteSelected}
          disabled={selectedIds.length === 0}
        >
          Supprimer la sélection
        </button>
      </div>

  <ul className="tache-items" style={{ minHeight: '400px', fontSize: '1.1rem', background: '#f9f9f9', borderRadius: '8px', padding: '1em', boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
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
              selected={selectedIds.includes(key)}
              onSelect={checked => handleSelectTache(key, checked)}
            />
          );
        })}
      </ul>
    </div>
  );
}