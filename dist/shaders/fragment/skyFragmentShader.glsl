uniform vec3 lightPos;
uniform vec3 cameraPos;
varying vec3 pos;
varying float elevation;
varying vec4 vNormal;
varying vec4 vPosition;
varying float noise;
varying vec2 st;

void main() {
    vec3 cloudColor = vec3(0.9, 0.9, 0.9);
    vec2 cloudRange = vec2(-10.0, 0.8);
    float interpolationDist = 0.3;
    vec3 finalColor= vec3(1.0,1.0,1.0);
    /*float clouds = smoothstep(cloudRange.x - interpolationDist, cloudRange.x, elevation) - 
       smoothstep(cloudRange.y - interpolationDist, cloudRange.y, elevation);*/

    vec2 F = 0.7 - cellular2x2(5.0 * st);	
    float n = 1.5*F.x*100.0-50.0;
    vec4 pattern = 0.1*vec4(0.7, 0.7, 0.7, 1.0);
    pattern *= n;
    // apply correct component based on elevation
    /*float clouds = smoothstep(cloudRange.x - interpolationDist, cloudRange.x, 0.6) - 
       smoothstep(cloudRange.y - interpolationDist, cloudRange.y, 0.6);
    finalColor = mix(finalColor, cloudColor, clouds);*/
    gl_FragColor = vec4(finalColor, 0.2) * pattern;// pattern;
}
