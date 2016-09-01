#extension GL_OES_standard_derivatives : enable

uniform float time;
varying vec4 vNormal;
uniform vec3 lightPos;
varying vec4 vPosition;
const vec3 ambientColor = vec3(0.15, 0.15, 0.15);
const vec3 diffuseColor = vec3(0.5, 0.0, 0.0);
const vec3 specularColor = vec3(1.0, 1.0, 1.0);
void main()
{
	vec3 oceanColor = vec3(0.1, 0.23, 0.42);

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
	gl_FragColor = vec4(ambientColor + lambertian * oceanColor + specular  * specularColor, 1.0);

}