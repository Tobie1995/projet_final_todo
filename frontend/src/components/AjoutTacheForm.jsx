import React, { useState } from 'react';

const AjoutTacheForm = ({ onAjoutTache }) => {
  const [nouvelleTache, setNouvelleTache] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (nouvelleTache.trim() === '') {
      alert('Veuillez saisir une tâche');
      return;
    }
    
    setIsLoading(true);
    
    try {
      await onAjoutTache(nouvelleTache.trim());
      setNouvelleTache('');
    } catch (error) {
      console.error('Erreur dans le formulaire:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setNouvelleTache(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className="ajout-tache-form">
      <div className="form-group">
        <input
          type="text"
          value={nouvelleTache}
          onChange={handleChange}
          placeholder="Saisissez une nouvelle tâche..."
          className="champ-saisie"
          disabled={isLoading}
        />
        <button 
          type="submit" 
          className="bouton-ajouter"
          disabled={isLoading}
        >
          {isLoading ? 'Ajout...' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
};

export default AjoutTacheForm;