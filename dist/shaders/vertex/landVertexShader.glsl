
uniform float time;
uniform float altitude;
uniform float mountainHeight;
uniform float islandFrequency;
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
    for (float i = 1.0; i < 10.0; i++) {
        elevation+= mountainHeight* (1.0/(i*2.0)) * snoise(islandFrequency*(i/50.0)*vec3(vPosition));
    }

    vPosition = vPosition + vNormal * 0.2 * elevation;

    elevation = elevation * -1.0;

    gl_Position = projectionMatrix * viewMatrix * vPosition;

}


