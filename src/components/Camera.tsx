import React, { useRef, useEffect } from 'react';
import { CameraControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useSnapshot } from 'valtio';
import store from '../store';

/*I used 'custom-camera' a well known three.js library. It has very advanced camera functions, which would allow
me to easily add functionality to this app if it was needed in the future.*/

const Camera: React.FC = () => {
  const cameraControlsRef = useRef<CameraControls>(null);
  const snap = useSnapshot(store);

  useEffect(() => {
    if (cameraControlsRef.current) {
      //when in edit mode camera does not rotate
      cameraControlsRef.current.enabled = !snap.editMode;

      // Set the min and max distance for the zoom
      cameraControlsRef.current.minDistance = 0; // Set your min zoom level
      cameraControlsRef.current.maxDistance = 8; // Set your max zoom level
    }
  }, [snap.editMode]);

  return <CameraControls ref={cameraControlsRef} />;
};

export default Camera;
