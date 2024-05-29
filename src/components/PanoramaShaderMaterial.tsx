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
  uniform bool highResTextureAvailable; // Flag to indicate if high-res texture is available
  const float blurRadius = 0.03; // Keeping the original blur radius
  const float aspectRatio = 2.0; // Hardcoded aspect ratio

  varying vec2 vUv;

  float getBlurFactor(vec2 uv) {
    float blurFactor = 0.0;
    for (int i = 0; i < numBlurRegions; i++) {
      vec2 blurCenter = vec2(blurRegions[i * 3], blurRegions[i * 3 + 1]);
      float distance = length(uv - blurCenter);
      if (distance < blurRadius) {
        blurFactor = max(blurFactor, 1.0 - distance / blurRadius);
      }
    }
    return blurFactor;
  }

  vec4 applyBoxBlur(sampler2D tex, vec2 uv, float radius) {
    vec4 color = vec4(0.0);
    int blurSize = 10;
    float totalSamples = float((blurSize * 2 + 1) * (blurSize * 2 + 1));
    
    for (int x = -blurSize; x <= blurSize; x++) {
      for (int y = -blurSize; y <= blurSize; y++) {
        vec2 offset = vec2(float(x) * radius / float(blurSize), float(y) * radius / float(blurSize) / aspectRatio);
        color += texture2D(tex, uv + offset);
      }
    }

    return color / totalSamples;
  }

  void main() {
    vec4 lowResColor = texture2D(lowResTexture, vUv);
    vec4 highResColor = vec4(0.0);

    if (highResTextureAvailable) {
      highResColor = texture2D(highResTexture, vUv);
    }

    vec4 color = mix(lowResColor, highResColor, blendFactor);

    float blurFactor = getBlurFactor(vUv);
    if (blurFactor > 0.0) {
      vec4 blurredColor = lowResColor;
      if (highResTextureAvailable) {
        blurredColor = applyBoxBlur(highResTexture, vUv, blurRadius);
      } else {
        blurredColor = applyBoxBlur(lowResTexture, vUv, blurRadius);
      }
      color = mix(color, blurredColor, blurFactor);
    }

    gl_FragColor = color;
  }
`;



const PanoramaShaderMaterial = (
  lowResTexture: Texture,
  highResTexture: Texture | null,
  blendFactor: number,
  blurRegions: number[]
) => {
  return new ShaderMaterial({
    uniforms: {
      lowResTexture: { value: lowResTexture },
      highResTexture: { value: highResTexture },
      blendFactor: { value: blendFactor },
      blurRegions: { value: blurRegions },
      numBlurRegions: { value: blurRegions.length / 3 }, // Each region has 3 components
      highResTextureAvailable: { value: highResTexture !== null } // Flag for high-res texture availability
    },
    vertexShader,
    fragmentShader,
    side: BackSide,
  });
};

export default PanoramaShaderMaterial;

