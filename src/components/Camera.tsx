import React, { useRef, useEffect } from 'react';
import { CameraControls } from '@react-three/drei';
import { useSnapshot } from 'valtio';
import store from '../store';

const Camera: React.FC = () => {
  const cameraControlsRef = useRef<CameraControls>(null);
  const snap = useSnapshot(store);

  useEffect(() => {
    if (cameraControlsRef.current) {
      cameraControlsRef.current.enabled = !snap.editMode;
    }
  }, [snap.editMode]);

  return <CameraControls ref={cameraControlsRef} />;
};

export default Camera;
