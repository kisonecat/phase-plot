#version 300 es

//precision mediump float;
precision highp float;

in vec2 z;

uniform vec2 a;
uniform vec2 b;
uniform vec2 c;
uniform vec2 d;
uniform vec2 e;
uniform vec2 f;
uniform vec2 g;
uniform vec2 h;
uniform vec2 j;
uniform vec2 k;
uniform vec2 l;
uniform vec2 m;
uniform vec2 n;
uniform vec2 o;
uniform vec2 p;
uniform vec2 q;
uniform vec2 r;
uniform vec2 s;
uniform vec2 t;
uniform vec2 u;
uniform vec2 v;
uniform vec2 w;
uniform vec2 x;
uniform vec2 y;

/*
 domainColoringParameters = ({
  rootDarkening,
  poleLightening,
  rectangularGridOpacity,
  polarGridOpacity,
  rootDarkeningSharpness,
  poleLighteningSharpness
})
*/  


//    #extension GL_OES_standard_derivatives : enable

#define PI 3.141592653589793238
#define HALF_PI 1.57079632679
#define HALF_PI_INV 0.15915494309
#define LOG_2 0.69314718056
#define C_ONE (vec2(1.0, 0.0))
#define C_I (vec2(0.0, 1.0))
#define TO_RADIANS 0.01745329251


vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


float hypot (vec2 z) {
  float t;
  float x = abs(z.x);
  float y = abs(z.y);
  t = min(x, y);
  x = max(x, y);
  t = t / x;
  return x * sqrt(1.0 + t * t);
}

/*
float cosh (float x) {
  return 0.5 * (exp(x) + exp(-x));
}

float sinh (float x) {
  return 0.5 * (exp(x) - exp(-x));
  }*/

vec2 sinhcosh (float x) {
  float ex = exp(x);
  float emx = exp(-x);
  return 0.5 * vec2(
      ex - emx,
      ex + emx
                    );
}

vec2 conjugate(vec2 a){
    return vec2(a.x, -a.y);
}

vec2 cabs(vec2 a) {
    return vec2(sqrt(a.x*a.x + a.y*a.y),0);
}

vec2 cmul (vec2 a, vec2 b) {
  return vec2(
      a.x * b.x - a.y * b.y,
      a.y * b.x + a.x * b.y
              );
}

vec2 cmul (vec2 a, vec2 b, vec2 c) {
  return cmul(cmul(a, b), c);
}

vec2 cdiv (vec2 a, vec2 b) {
  return vec2(
      a.y * b.y + a.x * b.x,
      a.y * b.x - a.x * b.y
              ) / dot(b, b);
}

vec2 cinv (vec2 z) {
  return vec2(z.x, -z.y) / dot(z, z);
}

vec2 cexp (vec2 z) {
  return vec2(cos(z.y), sin(z.y)) * exp(z.x);
}

vec2 clog (vec2 z) {
  return vec2(
      log(hypot(z)),
      atan(z.y, z.x)
              );
}

vec2 cpolar (vec2 z) {
  return vec2(
      atan(z.y, z.x),
      hypot(z)
              );
}

vec2 cpower (vec2 z, float x) {
  float r = hypot(z);
  float theta = atan(z.y, z.x) * x;
  return vec2(cos(theta), sin(theta)) * pow(r, x);
}

vec2 cpower (vec2 a, vec2 b) {
  float aarg = atan(a.y, a.x);
  float amod = hypot(a);
  float theta = log(amod) * b.y + aarg * b.x;
  return vec2(cos(theta), sin(theta)) * pow(amod, b.x) * exp(-aarg * b.y);
}

vec2 csqrt (vec2 z) {
  vec2 zpolar = cpolar(z);
  float theta = zpolar.x * 0.5;
  float mod = sqrt(zpolar.y);
  return vec2(cos(theta), sin(theta)) * mod;
}

vec2 csqr (vec2 z) {
  return vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y);
}

vec2 ccos (vec2 z) {
  return sinhcosh(z.y).yx * vec2(cos(z.x), -sin(z.x));
}

vec2 csin (vec2 z) {
  return sinhcosh(z.y).yx * vec2(sin(z.x), cos(z.x));
}

vec2 ctan (vec2 z) {
  vec2 e2iz = cexp(2.0 * vec2(-z.y, z.x));
  return cdiv(e2iz - C_ONE, cmul(C_I, C_ONE + e2iz));
}

vec2 cacos (vec2 z) {
  vec2 t1 = csqrt(vec2(z.y * z.y - z.x * z.x + 1.0, -2.0 * z.x * z.y));
  vec2 t2 = clog(vec2(t1.x - z.y, t1.y + z.x));
  return vec2(HALF_PI - t2.y, t2.x);
}

vec2 casin (vec2 z) {
  vec2 t1 = csqrt(vec2(z.y * z.y - z.x * z.x + 1.0, -2.0 * z.x * z.y));
  vec2 t2 = clog(vec2(t1.x - z.y, t1.y + z.x));
  return vec2(t2.y, -t2.x);
}

vec2 catan (vec2 z) {
  float d = z.x * z.x + (1.0 - z.y) * (1.0 - z.y);
  vec2 t1 = clog(vec2(1.0 - z.y * z.y - z.x * z.x, -2.0 * z.x) / d);
  return 0.5 * vec2(-t1.y, t1.x);
}

vec2 ccosh (vec2 z) {
  return sinhcosh(z.x).yx * vec2(cos(z.y), sin(z.y));
}

vec2 csinh (vec2 z) {
  return sinhcosh(z.x) * vec2(cos(z.y), sin(z.y));
}

vec2 ctanh (vec2 z) {
  vec2 ez = cexp(z);
  vec2 emz = cexp(-z);
  return cdiv(ez - emz, ez + emz);
}

// https://github.com/d3/d3-color
vec3 cubehelix(vec3 c) {
  float a = c.y * c.z * (1.0 - c.z);
  float cosh = cos(c.x + PI / 2.0);
  float sinh = sin(c.x + PI / 2.0);
  return vec3(
      (c.z + a * (1.78277 * sinh - 0.14861 * cosh)),
      (c.z - a * (0.29227 * cosh + 0.90649 * sinh)),
      (c.z + a * (1.97294 * cosh))
              );
}

// https://github.com/d3/d3-scale-chromatic
vec3 cubehelixRainbow(float t) {
  float ts = 0.25 - 0.25 * cos((t - 0.5) * PI * 2.0);
  return cubehelix(vec3(
      (360.0 * t - 100.0) * TO_RADIANS,
      1.5 - 1.5 * ts,
      (0.8 - 0.9 * ts)
                        ));
}

// https://github.com/rreusser/glsl-solid-wireframe
float wireframe (float parameter, float width, float feather) {
  float w1 = width - feather * 0.5;
  float d = fwidth(parameter);
  float looped = 0.5 - abs(mod(parameter, 1.0) - 0.5);
  return smoothstep(d * w1, d * (w1 + feather), looped);
}

float wireframe (vec2 parameter, float width, float feather) {
  float w1 = width - feather * 0.5;
  vec2 d = fwidth(parameter);
  vec2 looped = 0.5 - abs(mod(parameter, 1.0) - 0.5);
  vec2 a2 = smoothstep(d * w1, d * (w1 + feather), looped);
  return min(a2.x, a2.y);
}

float wireframe (vec3 parameter, float width, float feather) {
  float w1 = width - feather * 0.5;
  vec3 d = fwidth(parameter);
  vec3 looped = 0.5 - abs(mod(parameter, 1.0) - 0.5);
  vec3 a3 = smoothstep(d * w1, d * (w1 + feather), looped);
  return min(min(a3.x, a3.y), a3.z);
}

float wireframe (vec4 parameter, float width, float feather) {
  float w1 = width - feather * 0.5;
  vec4 d = fwidth(parameter);
  vec4 looped = 0.5 - abs(mod(parameter, 1.0) - 0.5);
  vec4 a4 = smoothstep(d * w1, d * (w1 + feather), looped);
  return min(min(min(a4.x, a4.y), a4.z), a4.w);
}

float wireframe (float parameter, float width) {
  float d = fwidth(parameter);
  float looped = 0.5 - abs(mod(parameter, 1.0) - 0.5);
  return smoothstep(d * (width - 0.5), d * (width + 0.5), looped);
}

float wireframe (vec2 parameter, float width) {
  vec2 d = fwidth(parameter);
  vec2 looped = 0.5 - abs(mod(parameter, 1.0) - 0.5);
  vec2 a2 = smoothstep(d * (width - 0.5), d * (width + 0.5), looped);
  return min(a2.x, a2.y);
}

float wireframe (vec3 parameter, float width) {
  vec3 d = fwidth(parameter);
  vec3 looped = 0.5 - abs(mod(parameter, 1.0) - 0.5);
  vec3 a3 = smoothstep(d * (width - 0.5), d * (width + 0.5), looped);
  return min(min(a3.x, a3.y), a3.z);
}

float wireframe (vec4 parameter, float width) {
  vec4 d = fwidth(parameter);
  vec4 looped = 0.5 - abs(mod(parameter, 1.0) - 0.5);
  vec4 a4 = smoothstep(d * (width - 0.5), d * (width + 0.5), looped);
  return min(min(min(a4.x, a4.y), a4.z), a4.z);
}

uniform float rootDarkening, poleLightening;
uniform float rootDarkeningSharpness, poleLighteningSharpness;
uniform float rectangularGridOpacity, polarGridOpacity;
uniform float axisOpacity;
uniform float pixelRatio;

vec2 theFunction(vec2 z) {
  return THEFUNCTIONGOESHERE;
}

vec3 domainColoring (
    vec2 z,
    vec2 polarGridSpacing,
    float polarGridStrength,
    vec2 rectGridSpacing,
    float rectGridStrength,
    float poleLightening,
    float poleLighteningSharpness,
    float rootDarkening,
    float rootDarkeningSharpness,
    float lineWidth
                     ) {
  vec2 zpolar = cpolar(z);
  float carg = zpolar.x * HALF_PI_INV;
  float logmag = log2(zpolar.y) * 0.5 / LOG_2;
  float rootDarkeningFactor = pow(2.0, -zpolar.y * rootDarkeningSharpness);
  float rootDarkness = 1.0 - rootDarkening * rootDarkeningFactor;
  float poleLighteningFactor = 1.0 - pow(2.0, -zpolar.y / poleLighteningSharpness);
  float poleLightness = 1.0 - poleLightening * poleLighteningFactor;
  float polarGridFactor = wireframe((vec2(carg, logmag) / polarGridSpacing), lineWidth, 1.0);
  float polarGrid = mix(1.0 - polarGridStrength, 1.0, polarGridFactor);
  float rectGridFactor = 1.0 - (1.0 - poleLighteningFactor) * (1.0 - wireframe((z / rectGridSpacing), lineWidth, 1.0));
  float rectGrid = mix(1.0 - rectGridStrength, 1.0, rectGridFactor);
  
  return mix(
      vec3(1.0),
      mix(
          vec3(0.0),
          mix(vec3(1.0), cubehelixRainbow(carg + 0.25) * rootDarkness, poleLightness),
          mix(rectGrid, max(rectGrid, 1.0 - polarGridFactor), polarGridStrength)
          ),
      polarGrid
             );
}

out vec4 color;

void main () {
  vec3 domain = domainColoring(
      theFunction(z),              // The evaluated function!
      vec2(0.125, 1.0),        // Polar grid spacing
      polarGridOpacity,        // Polar grid strength
      vec2(1.0),               // Rectangular grid spacing
      rectangularGridOpacity,  // Rectangular grid strength
      poleLightening,          // Pole lightening strength
      poleLighteningSharpness, // Pole ligthening sharpness
      rootDarkening,           // Root darkening strength
      rootDarkeningSharpness,  // Root darkening sharpness
      0.5 * pixelRatio         // Line thickness
                               );

  float axisGrid = wireframe(z, 0.60*pixelRatio, 1.0);
  float yAxis = 1.0 - step( z.x, 0.020 ) * step( -z.x, 0.020 ) * (1.0 - axisGrid);
  float xAxis = 1.0 - step( z.y, 0.020 ) * step( -z.y, 0.020 ) * (1.0 - axisGrid);

  float tickGrid = wireframe(z*10.0, 0.30*pixelRatio, 1.0);
  float yTick = 1.0 - step( z.x, 0.010 ) * step( -z.x, 0.010 ) * (1.0 - tickGrid);
  float xTick = 1.0 - step( z.y, 0.010 ) * step( -z.y, 0.010 ) * (1.0 - tickGrid);
  
  domain = mix( vec3(0.0), domain, min(1.0, xAxis * yAxis * xTick * yTick + 1.0 - axisOpacity) );
  
  color = vec4(domain, 1.0);
}
