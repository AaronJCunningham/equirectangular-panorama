import React, { useRef, useEffect } from 'react';
import { CameraControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useSnapshot } from 'valtio';
import store from '../store';

const Camera: React.FC = () => {
  const cameraControlsRef = useRef<CameraControls>(null);
  const { camera } = useThree();
  const snap = useSnapshot(store);

  useEffect(() => {
    if (cameraControlsRef.current) {
      cameraControlsRef.current.enabled = !snap.editMode;

      // Set the min and max distance for the zoom
      cameraControlsRef.current.minDistance = 0; // Set your min zoom level
      cameraControlsRef.current.maxDistance = 8; // Set your max zoom level
    }
  }, [snap.editMode]);

  return <CameraControls ref={cameraControlsRef} />;
};

export default Camera;
