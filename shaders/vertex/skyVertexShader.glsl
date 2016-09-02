uniform float altitude;
uniform float height;
uniform float cloudFrequency;
varying float noise;
varying vec2 st;
varying float elevation;
varying vec3 pos;

varying vec4 vPosition;
varying vec4 vNormal;
void main() {
    st = uv;
    vPosition = modelMatrix * vec4(position, 1.0);
    vNormal = modelMatrix * vec4(normal, 1.0);

    elevation = 0.0;
    vec2 hej;
    //hej = vec2(cellular(vec3(vPosition)));

    //vPosition = vPosition + 0.03* vNormal * snoise(vec3(vPosition));
    gl_Position = projectionMatrix * viewMatrix * vPosition;
}