uniform float time;
uniform float altitude;
varying vec3 vNormal;
varying float noise;
varying vec2 st;
varying float elevation;
varying vec3 pos;


void main() {
    st = uv;
    
    noise = snoise(0.1*position);
    pos = position + normal*noise;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    
}