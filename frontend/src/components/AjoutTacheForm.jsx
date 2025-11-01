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
    <form onSubmit={handleSubmit} className="ajout-tache-form" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.12)', borderRadius: '10px', background: '#fff', margin: '16px auto', maxWidth: '500px', padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="form-group" style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <input
          type="text"
          value={nouvelleTache}
          onChange={handleChange}
          className="form-input"
          placeholder="Saisissez une nouvelle tâche..."
          disabled={isLoading}
          style={{ flex: 1, textAlign: 'center' }}
        />
        <button type="submit" className="btn-ajouter" disabled={isLoading}>
          {isLoading ? 'Ajout...' : 'Ajouter'}
        </button>
      </div>
    </form>
  );
}

export default AjoutTacheForm;