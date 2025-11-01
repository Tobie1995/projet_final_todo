import React, { useState } from "react";

const TacheItem = ({ tache, handleSupprimeTache, handleToggleTache, handleUpdateTache }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitre, setEditTitre] = useState(tache.titre);
  const [localTitre, setLocalTitre] = useState(tache.titre);

  const handleEditClick = () => {
  setIsEditing(true);
  setEditTitre(tache.titre);
  };

  const handleCancelEdit = () => {
  setIsEditing(false);
  setEditTitre(tache.titre);
  };

  const handleSaveEdit = () => {
    if (editTitre.trim() !== "") {
      handleUpdateTache(tache.id, { titre: editTitre });
      setLocalTitre(editTitre);
      setIsEditing(false);
    }
  };

  return (
    <li className="tache-item" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: '10px', background: '#fff', margin: '16px auto', maxWidth: '500px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1em', justifyContent: 'center', width: '100%' }}>
        <input
          type="checkbox"
          checked={!!tache.termine}
          onChange={() => handleToggleTache(tache.id, tache.termine)}
          style={{ marginRight: "0.5em" }}
        />
        {isEditing ? (
          <input
            type="text"
            value={editTitre}
            onChange={e => setEditTitre(e.target.value)}
            className="form-input"
            placeholder="Titre de la tâche"
            style={{ flex: 1, textAlign: 'center' }}
          />
        ) : (
          <span className="tache-titre" style={{ flex: 1, textAlign: 'center' }}>{localTitre}</span>
        )}
        {isEditing ? (
          <>
            <button onClick={handleSaveEdit} className="btn-ajouter" style={{ marginRight: "0.5em" }}>Valider</button>
              <button onClick={handleCancelEdit} className="btn-ajouter" style={{ backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 16px', marginRight: '0.5em', cursor: 'pointer' }}>Annuler</button>
          </>
        ) : (
          <button onClick={handleEditClick} className="btn-ajouter" style={{ marginLeft: "1em" }}>Modifier</button>
        )}
        <button onClick={() => handleSupprimeTache(tache.id)} className="btn-supprimer" style={{ marginLeft: "1em", backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', padding: '10px 16px', cursor: 'pointer' }}>
          Supprimer
        </button>
      </div>
    </li>
  );
};

export default TacheItem;
