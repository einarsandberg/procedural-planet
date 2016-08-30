#extension GL_OES_standard_derivatives : enable

uniform vec3 lightPos;
uniform vec3 cameraPos;
varying vec3 pos;
varying float elevation;
varying vec4 vNormal;
varying vec4 vPosition;
varying float noise;
varying vec2 st;

const vec3 ambientColor = vec3(0.15, 0.15, 0.15);
const vec3 diffuseColor = vec3(0.5, 0.0, 0.0);
const vec3 specularColor = vec3(1.0, 1.0, 1.0);
vec3 gravelColor;
vec3 landColor;
vec3 sandColor;
vec3 oceanColor;
vec3 finalColor;
vec3 snowColor;
vec3 landNoise;
void initColors() {
   float n = 0.6 * snoise(0.3*vec3(vPosition));
   n += 0.3 * snoise(0.6*vec3(vPosition));
   gravelColor = vec3(0.5, 0.5, 0.5);
   landColor = vec3(0.0, 0.5, 0.0);
   landNoise = 0.5*landColor;
   gravelColor = mix(gravelColor, landNoise, clamp(n, 0.0, 1.0));

   landNoise -= 0.05 * snoise(10.0 * vec3(vPosition));
   landColor = mix(landColor, landNoise, clamp(n, 0.0, 1.0));

   sandColor = vec3(0.75, 0.65, 0.4);
   oceanColor = vec3(0.1, 0.23, 0.42);
   snowColor = vec3(1.0, 1.0, 1.0);

}
void main() {

   initColors();
   // phong blinn model
   vec3 newNormal = normalize(cross(dFdx(vec3(vNormal)), dFdy(vec3(vNormal))));
   vec3 lightDir = normalize(lightPos - vec3(vPosition));

   float lambertian = max(dot(lightDir, newNormal), 0.0);
   float specular = 0.0;

     if(lambertian > 0.0) {
       vec3 viewDir = normalize(-vec3(newNormal));
       vec3 halfDir = normalize(lightDir + viewDir);
       float specAngle = max(dot(halfDir, newNormal), 0.0);
       specular = pow(specAngle, 16.0);
     }

   // interpolation distance
   float interpolationDist = 0.3;

   /*vec2 oceanRange = vec2(-4.0, -0.2);
   vec2 sandRange = vec2(-0.2, 0.08);
   vec2 landRange = vec2(0.08, 0.5);
   vec2 gravelRange = vec2(0.5, 0.8);
   vec2 snowRange = vec2(0.8, 2.0);*/
   //vec2 oceanRange = vec2(-4.0, 0.5);
   vec2 sandRange = vec2(0.0, 0.28);
   vec2 landRange = vec2(0.28, 0.7);
   vec2 gravelRange = vec2(0.7, 1.0);
   vec2 snowRange = vec2(1.0, 2.2);

   // apply correct component based on elevation
  /* float ocean = smoothstep(oceanRange.x - interpolationDist, oceanRange.x, elevation) - 
      smoothstep(oceanRange.y - interpolationDist, oceanRange.y,  elevation);*/
   float sand = smoothstep(sandRange.x - interpolationDist, sandRange.x, elevation) - 
      smoothstep(sandRange.y - interpolationDist, sandRange.y, elevation);
   float land = smoothstep(landRange.x - interpolationDist, landRange.x, elevation) - 
      smoothstep(landRange.y - interpolationDist, landRange.y, elevation);
   float gravel = smoothstep(gravelRange.x - interpolationDist, gravelRange.x, elevation) - 
      smoothstep(gravelRange.y - interpolationDist, gravelRange.y, elevation);
   float snow = smoothstep(snowRange.x - interpolationDist, snowRange.x, elevation) - 
      smoothstep(snowRange.y - interpolationDist, snowRange.y, elevation);
      // apply colors
   finalColor = vec3(0.0, 0.0, 0.0);
   //finalColor = mix(finalColor, oceanColor, ocean);
   finalColor = mix(finalColor, sandColor, sand);
   finalColor = mix(finalColor, landColor, land);
   finalColor = mix(finalColor, gravelColor, gravel);
   finalColor = mix(finalColor, snowColor, snow);


  // finalColor = mix(finalColor, snowColor, snow);
   //gl_FragColor = vec4(ambientColor + lambertian * finalColor + specular  * specularColor, 1.0);
   gl_FragColor = vec4(finalColor, 1.0);

}