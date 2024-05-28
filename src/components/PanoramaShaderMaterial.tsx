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
  const float blurRadius = 0.03; // Increased blur radius

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

  vec4 applyGaussianBlur(sampler2D tex, vec2 uv, float radius) {
    vec4 color = vec4(0.0);
    float totalWeight = 0.0;
    float weight;
    float offsets[7] = float[](0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0);
    float kernel[7] = float[](0.204164, 0.304005, 0.186192, 0.098788, 0.034101, 0.009307, 0.001443);

    for (int i = 0; i < 7; i++) {
      weight = kernel[i];
      color += texture2D(tex, uv + vec2(radius * offsets[i], 0.0)) * weight;
      color += texture2D(tex, uv - vec2(radius * offsets[i], 0.0)) * weight;
      totalWeight += 2.0 * weight;
    }

    for (int i = 0; i < 7; i++) {
      weight = kernel[i];
      color += texture2D(tex, uv + vec2(0.0, radius * offsets[i])) * weight;
      color += texture2D(tex, uv - vec2(0.0, radius * offsets[i])) * weight;
      totalWeight += 2.0 * weight;
    }

    return color / totalWeight;
  }

  void main() {
    vec4 lowResColor = texture2D(lowResTexture, vUv);
    vec4 highResColor = texture2D(highResTexture, vUv);
    vec4 color = mix(lowResColor, highResColor, blendFactor);

    float blurFactor = getBlurFactor(vUv);
    if (blurFactor > 0.0) {
      vec4 blurredColor = applyGaussianBlur(highResTexture, vUv, blurRadius);
      vec4 greyColor = vec4(0.8, 0.8, 0.8, 05); // Light grey color
      color = mix(color, blurredColor, blurFactor);
      color = mix(color, greyColor, blurFactor * 0.5); // Mix with grey color
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
