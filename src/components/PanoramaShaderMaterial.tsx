import { useEffect } from 'react';
import { ShaderMaterial, Texture, BackSide } from 'three';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D lowResTexture;
  uniform sampler2D highResTexture;
  uniform float blendFactor;
  uniform float blurRegions[30]; // Support up to 10 blur regions (each with 3 components)
  uniform int numBlurRegions;
  const float blurRadius = 0.05; // Increased blur radius for visibility

  varying vec2 vUv;

  float getBlurFactor(vec2 uv) {
    float blurFactor = 0.0;
    for (int i = 0; i < numBlurRegions; i++) {
      vec2 blurCenter = vec2(blurRegions[i * 3], blurRegions[i * 3 + 1]); // Extract vec2 from flat array
      float distance = length(uv - blurCenter);
      if (distance < blurRadius) {
        blurFactor = max(blurFactor, 1.0 - distance / blurRadius);
      }
    }
    return blurFactor;
  }

  void main() {
    vec4 lowResColor = texture2D(lowResTexture, vUv);
    vec4 highResColor = texture2D(highResTexture, vUv);
    vec4 color = mix(lowResColor, highResColor, blendFactor);

    float blurFactor = getBlurFactor(vUv);
    if (blurFactor > 0.0) {
      color = vec4(1.0, 0.0, 0.0, 1.0); // Mark blur regions with red color for debugging
    }

    gl_FragColor = color;
  }
`;

const PanoramaShaderMaterial = (
  lowResTexture: Texture,
  highResTexture: Texture,
  blendFactor: number,
  blurRegions: number[]
) => {

  // useEffect(() => {
  //   console.log("blurRegions: ", blurRegions); // Log blurRegions to debug
  // }, [blurRegions]);

  return new ShaderMaterial({
    uniforms: {
      lowResTexture: { value: lowResTexture },
      highResTexture: { value: highResTexture },
      blendFactor: { value: blendFactor },
      blurRegions: { value: blurRegions },
      numBlurRegions: { value: blurRegions.length / 3 }, // Each region has 3 components
    },
    vertexShader,
    fragmentShader,
    side: BackSide,
  });
};

export default PanoramaShaderMaterial;
