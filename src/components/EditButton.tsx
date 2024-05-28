import React from 'react';
import { useSnapshot } from 'valtio';
import store from '../store';

const EditButton: React.FC = () => {
  const snap = useSnapshot(store);

  const toggleEditMode = () => {
    store.editMode = !store.editMode;
  };

  return (
    <button className="edit-button" onClick={toggleEditMode}>
      {snap.editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
    </button>
  );
};

export default EditButton;
