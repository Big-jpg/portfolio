import { useEffect, useRef } from "react";

const vertexShaderSource = `
  attribute vec2 a_position;

  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fragmentShaderSource = `
  precision mediump float;

  uniform vec2 u_resolution;
  uniform float u_time;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    vec2 ease = local * local * (3.0 - 2.0 * local);

    return mix(
      mix(hash(cell), hash(cell + vec2(1.0, 0.0)), ease.x),
      mix(
        hash(cell + vec2(0.0, 1.0)),
        hash(cell + vec2(1.0, 1.0)),
        ease.x
      ),
      ease.y
    );
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;

    for (int octave = 0; octave < 4; octave++) {
      value += amplitude * noise(point);
      point = point * 2.03 + vec2(13.1, 7.7);
      amplitude *= 0.5;
    }

    return value;
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / u_resolution.y;
    float cycle = 0.5 + 0.5 * cos(u_time * 0.035);
    float day = smoothstep(0.18, 0.82, cycle);
    float twilight = 1.0 - abs(cycle * 2.0 - 1.0);

    vec3 nightTop = vec3(0.025, 0.065, 0.11);
    vec3 nightHorizon = vec3(0.08, 0.18, 0.23);
    vec3 dayTop = vec3(0.59, 0.81, 0.82);
    vec3 dayHorizon = vec3(0.91, 0.95, 0.84);

    float horizon = smoothstep(0.72, -0.88, uv.y);
    vec3 skyTop = mix(nightTop, dayTop, day);
    vec3 skyBottom = mix(nightHorizon, dayHorizon, day);
    vec3 color = mix(skyTop, skyBottom, horizon);

    vec2 sunPosition = vec2(-0.46, mix(-0.15, 0.36, cycle));
    float sunDistance = length(uv - sunPosition);
    float sunGlow = 0.055 / (sunDistance * sunDistance + 0.055);
    vec3 sunColor = mix(vec3(1.0, 0.53, 0.32), vec3(1.0, 0.94, 0.68), day);
    color += sunColor * sunGlow * (0.18 + day * 0.18 + twilight * 0.16);

    vec2 moonPosition = vec2(0.5, 0.28);
    float moonDistance = length(uv - moonPosition);
    float moonGlow = 0.025 / (moonDistance * moonDistance + 0.035);
    color += vec3(0.58, 0.72, 0.9) * moonGlow * (1.0 - day) * 0.3;

    vec2 water = uv * vec2(2.2, 3.2);
    float drift = u_time * 0.055;
    float firstFlow = fbm(water + vec2(drift, -drift * 0.28));
    float secondFlow = fbm(water * 1.36 + vec2(-drift * 0.63, drift * 0.34));
    float waveA = sin((water.y + firstFlow * 1.25) * 6.3 + drift * 4.0);
    float waveB = sin((water.x * 0.72 - secondFlow) * 5.1 - drift * 2.5);
    float caustic = pow(clamp(1.0 - abs(waveA + waveB) * 0.48, 0.0, 1.0), 9.0);
    float waterMask = smoothstep(0.82, -0.2, uv.y);

    vec3 waterTint = mix(vec3(0.1, 0.31, 0.37), vec3(0.24, 0.68, 0.63), day);
    color = mix(color, waterTint, waterMask * 0.19);
    color += mix(vec3(0.23, 0.48, 0.58), vec3(0.77, 0.94, 0.77), day)
      * caustic * waterMask * 0.2;

    float vignette = smoothstep(1.75, 0.28, length(uv * vec2(0.7, 0.5)));
    color *= mix(0.88, 1.04, vignette);
    color += (hash(gl_FragCoord.xy) - 0.5) / 255.0;

    gl_FragColor = vec4(color, 1.0);
  }
`;

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
) {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

export function AmbientCaustics() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ambientRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ambient = ambientRef.current;
    if (!canvas || !ambient) return;
    const shell = ambient.closest<HTMLElement>(".portfolio-shell");

    const gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return;
    }

    const positionBuffer = gl.createBuffer();
    if (!positionBuffer) return;

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    gl.useProgram(program);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    const timeLocation = gl.getUniformLocation(program, "u_time");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isVisible = true;
    let animationFrame = 0;
    let lastPhase = "";
    const startedAt = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.max(1, Math.floor(rect.width * pixelRatio));
      const height = Math.max(1, Math.floor(rect.height * pixelRatio));

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    };

    const draw = (now: number) => {
      resize();
      const elapsed = motionQuery.matches ? 0 : (now - startedAt) / 1000;
      const cycle = 0.5 + 0.5 * Math.cos(elapsed * 0.035);
      const phase = cycle < 0.38 ? "night" : cycle > 0.62 ? "day" : "dawn";

      if (phase !== lastPhase) {
        ambient.dataset.phase = phase;
        if (shell) shell.dataset.ambientPhase = phase;
        lastPhase = phase;
      }

      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
      gl.uniform1f(timeLocation, elapsed);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (!motionQuery.matches && isVisible && !document.hidden) {
        animationFrame = requestAnimationFrame(draw);
      }
    };

    const start = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(draw);
    };

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start();
    });
    const resizeObserver = new ResizeObserver(resize);
    const handleVisibility = () => {
      if (!document.hidden && isVisible) start();
    };
    const handleMotion = () => start();

    intersectionObserver.observe(canvas);
    resizeObserver.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibility);
    motionQuery.addEventListener("change", handleMotion);
    start();

    return () => {
      cancelAnimationFrame(animationFrame);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      motionQuery.removeEventListener("change", handleMotion);
      if (shell) delete shell.dataset.ambientPhase;
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <div
      ref={ambientRef}
      className="portfolio-ambient"
      data-phase="day"
      data-testid="ambient-caustics"
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}
