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
  varying vec2 vUv;
  void main() {
    vec4 lowResColor = texture2D(lowResTexture, vUv);
    vec4 highResColor = texture2D(highResTexture, vUv);
    gl_FragColor = mix(lowResColor, highResColor, blendFactor);
  }
`;

const PanoramaShaderMaterial = (lowResTexture: Texture, highResTexture: Texture, blendFactor: number) => {
  return new ShaderMaterial({
    uniforms: {
      lowResTexture: { value: lowResTexture },
      highResTexture: { value: highResTexture },
      blendFactor: { value: blendFactor },
    },
    vertexShader,
    fragmentShader,
    side: BackSide,
  });
};

export default PanoramaShaderMaterial;
