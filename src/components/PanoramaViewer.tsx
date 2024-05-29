import React, { useState, useEffect, useMemo, useRef, MutableRefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { TextureLoader, SphereGeometry, Mesh, Vector2, Raycaster, Texture, Vector3, Spherical } from 'three';
import PanoramaShaderMaterial from './PanoramaShaderMaterial';
import { useSnapshot } from 'valtio';
import store from '../store';
import useLocalStorage from '../hooks/useLocalStorage';

/*loads the image and has onDoubleClick functionality to add blur regions
*/

const lowResTextureUrl = "/images/pano_small.jpg";
const highResTextureUrl = "/images/pano.jpg";

type BlurRegion = {
  x: number;
  y: number;
  z: number;
};

const PanoramaViewer: React.FC = () => {
  const snap = useSnapshot(store);
  const { gl, camera } = useThree();
  const [lowResTexture, setLowResTexture] = useState<Texture | null>(null);
  const [highResTexture, setHighResTexture] = useState<Texture | null>(null);
  const blendFactorRef = useRef(0);
  const [highResLoaded, setHighResLoaded] = useState(false);
  const sphereRef = useRef<Mesh>();

  // Initialize blurRegions from localStorage
  const [blurStorage, setBlurStorage] = useLocalStorage<BlurRegion[]>("regions", []);

  useEffect(() => {
    // Set the initial blurRegions in the store
    store.blurRegions = blurStorage;

    const textureLoader = new TextureLoader();
    textureLoader.load(lowResTextureUrl, (texture) => {
      setLowResTexture(texture);
    });

    textureLoader.load(highResTextureUrl, (texture) => {
      setHighResTexture(texture);
      setHighResLoaded(true);
    });
  }, []);

  const geometry = useMemo(() => new SphereGeometry(8, 60, 40), []);
  const mesh = useMemo(() => new Mesh(geometry), [geometry]);

  // Convert blur regions from store to flat array
  const blurRegions = useMemo(
    () => (snap.blurRegions ? snap.blurRegions.flatMap(region => [region.x, region.y, region.z]) : []),
    [snap.blurRegions]
  );

//loads shader material
  const material = useMemo(() => {
    if (lowResTexture) {
      return PanoramaShaderMaterial(lowResTexture, highResTexture, blendFactorRef.current, blurRegions);
    }
    return null;
  }, [lowResTexture, highResTexture, blurRegions]);

  // Ensure the material is applied only when it is defined
  if (material) {
    mesh.material = material;
  }

//this converts the world coordinates to uv coordinates for the shader.
  const convertWorldToUV = (point: Vector3) => {
    const spherical = new Spherical().setFromVector3(point);
    const u = 0.5 - (Math.atan2(point.z, point.x) / (2 * Math.PI));
    const v = 0.5 + (Math.asin(point.y / spherical.radius) / Math.PI);
    return new Vector2(u, v);
  };

  //converts clicks into world coordinates
  const handleClick = (event: MouseEvent) => {
    if (!store.editMode) return;

    const rect = gl.domElement.getBoundingClientRect();
    const mouse = new Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    const raycaster = new Raycaster();
    raycaster.setFromCamera(mouse, camera);

    if (sphereRef.current) {
      const intersects = raycaster.intersectObject(sphereRef.current);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        const uv = convertWorldToUV(point);
        const newRegion = { x: uv.x, y: uv.y, z: 0 };
        store.blurRegions.push(newRegion);
        setBlurStorage([...blurStorage, newRegion]); // Update localStorage
     
      }
    }
  };

  //updates the shader
  useFrame(() => {
    if (highResLoaded && blendFactorRef.current < 1) {
      blendFactorRef.current = Math.min(blendFactorRef.current + 0.01, 1);
      if (material) {
        material.uniforms.blendFactor.value = blendFactorRef.current;
        material.uniforms.blurRegions.value = blurRegions;
        material.uniforms.numBlurRegions.value = blurRegions.length / 3;
        material.uniforms.highResTexture.value = highResTexture || lowResTexture; // Update texture dynamically
        material.uniforms.highResTextureAvailable.value = highResTexture !== null; // Update availability flag
      }
    }
  });

  return <primitive ref={sphereRef as MutableRefObject<Mesh>} object={mesh} onDoubleClick={handleClick} />;
};

export default PanoramaViewer;
