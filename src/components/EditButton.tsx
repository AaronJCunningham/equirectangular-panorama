import React from 'react';
import { useSnapshot } from 'valtio';
import store from '../store';
import useLocalStorage from '../hooks/useLocalStorage';

type BlurRegion = {
  x: number;
  y: number;
  z: number;
};

//two buttons for edit mode and to reset the blur regions


const EditButton: React.FC = () => {
  const snap = useSnapshot(store);
  const [blurStorage, setBlurStorage] = useLocalStorage<BlurRegion[]>('regions', []);

  const toggleEditMode = () => {
    store.editMode = !store.editMode;
  };

  const resetBlurRegions = () => {
    store.blurRegions = [];
    setBlurStorage([]); // Reset localStorage
  };

  return (
    <div className="button-container">
      <button className="edit-button" onClick={toggleEditMode}>
        {snap.editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
      </button>
      <button className="reset-button" onClick={resetBlurRegions}>
        Reset Blur Regions
      </button>
    </div>
  );
};

export default EditButton;
