uniform float time;
varying vec4 vNormal;
varying float noise;
varying vec2 st;
varying vec3 pos;
varying vec4 vPosition;

void main() {
    st = uv;
    vNormal = modelMatrix * vec4(normal, 1.0);
    vPosition = modelMatrix * vec4(position, 1.0);

    noise = snoise(0.1*vec4(position, time));
    pos = position + normal*noise;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    
}