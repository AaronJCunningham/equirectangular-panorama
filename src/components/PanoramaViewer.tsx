import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { TextureLoader, SphereGeometry, Mesh, SRGBColorSpace, Texture } from 'three';
import PanoramaShaderMaterial from './PanoramaShaderMaterial';

const PanoramaViewer: React.FC = () => {
  const lowResTextureUrl = "/images/pano_small.jpg";
  const highResTextureUrl = "/images/pano.jpg";

  const { gl } = useThree();
  const [lowResTexture, setLowResTexture] = useState<Texture | null>(null);
  const [highResTexture, setHighResTexture] = useState<Texture | null>(null);
  const blendFactorRef = useRef(0)
  const [highResLoaded, setHighResLoaded] = useState(false);

  useEffect(() => {
    const textureLoader = new TextureLoader();

    textureLoader.load(lowResTextureUrl, (texture) => {
    //   texture.colorSpace = SRGBColorSpace;
      setLowResTexture(texture);
    });

    textureLoader.load(highResTextureUrl, (texture) => {
    //   texture.colorSpace = SRGBColorSpace;
      setHighResTexture(texture);
      setHighResLoaded(true);
    });
  }, []);

  const geometry = useMemo(() => new SphereGeometry(100, 60, 40), []);
  const mesh = useMemo(() => new Mesh(geometry), [geometry]);



  const material = useMemo(
    () => lowResTexture && highResTexture && PanoramaShaderMaterial(lowResTexture, highResTexture, blendFactorRef.current),
    [lowResTexture, highResTexture]
  );

  if (material) {
    mesh.material = material;
  }

  useFrame(() => {
    if (highResLoaded && blendFactorRef.current < 1) {
        blendFactorRef.current = Math.min(blendFactorRef.current + 0.01, 1);
      if(material) { material.uniforms.blendFactor.value = blendFactorRef.current;}
      }
  })

  return  <primitive object={mesh} /> ;
};

export default PanoramaViewer;
