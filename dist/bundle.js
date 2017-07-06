(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
//browserify -t browserify-shader main.js -o bundle.js
var container, 
    renderer, 
    scene, 
    camera, 
    land,
    ocean,
    sky,
    start = Date.now(),
    fov = 30,
    mountainHeight = {
      type: "f",
      value: 2.0
    },
    islandFrequency = {
      type: "f",
      value: 5.0
    },
    grassAmount = {
      type: "f",
      value: 0.28
    },
    waterLevelScale = 1;

var width = window.innerWidth - 100;
var height = window.innerHeight - 100;
// Vertex shaders
var landVertexShader = require("../shaders/vertex/landVertexShader.glsl");
var oceanVertexShader = require("../shaders/vertex/oceanVertexShader.glsl")
var skyVertexShader = require("../shaders/vertex/skyVertexShader.glsl");
// Fragment shaders
var landFragmentShader = require("../shaders/fragment/landFragmentShader.glsl");
var oceanFragmentShader = require("../shaders/fragment/oceanFragmentShader.glsl");
var skyFragmentShader = require("../shaders/fragment/skyFragmentShader.glsl");
// noise functions
var noise = require("../shaders/noise/classicNoise3D.glsl");
var simplexNoise = require("../shaders/noise/noise3D.glsl");
var simplexNoise4D = require("../shaders/noise/noise4D.glsl");
var simplexNoise2D = require("../shaders/noise/noise2D.glsl");
var classicNoise = require("../shaders/noise/classicnoise3D.glsl");
var cellularNoise = require("../shaders/noise/cellular2x2.glsl");
// onchange functions
$(document).ready(function(){
  $("#mountain-height-slider").on("input", function() {
    mountainHeight.value = $(this).val();
  });
  $("#island-frequency-slider").on("input", function() {
    islandFrequency.value = $(this).val();
  });
  $("#water-level-slider").on("input", function() {
    waterLevelScale = $(this).val();
  });
});
init();
render();


function init() {
  // grab the container from the DOM

  container = document.getElementById("container");
      
  // create a scene
  scene = new THREE.Scene();

  // create a camera the size of the browser window
  // and place it 100 units away, looking towards the center of the scene
  camera = new THREE.PerspectiveCamera( 
      fov, 
      width / height, 
      1, 
      10000 );
  camera.position.z = 20;
  camera.position.x = 0;
  camera.position.y = 0;
  camera.lookAt(new THREE.Vector3(0,0,0));
  scene.add(camera);
  var light = new THREE.PointLight(0xffffff);
  var lightPos = new THREE.Vector3(500, 5000, 5000);
  light.position = lightPos;
  scene.add(light);

  var uniforms = {
    time: {
        type: "f",
        value: 0.0
    },
    altitude: {
        type: "f",
        value: 40.0
    },
    lightPos: {
      type: "v3",
      value: lightPos
    },
    cameraPos: {
      type: "v3",
      value: camera.position
    },
    grassAmount: grassAmount,
    mountainHeight: mountainHeight,
    islandFrequency: islandFrequency,
    derivatives: true
  };

  var skyUniforms = {
    altitude: {
      type: "f",
      value: 40.0
    },
    height: {
      type: "f",
      value: 2
    },
    cloudFrequency: {
      type: "f",
      value: 5.0
    }
  };

  landMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: simplexNoise() + landVertexShader(),
    fragmentShader: simplexNoise() + landFragmentShader()
  });

  oceanMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: simplexNoise4D() + oceanVertexShader(),
    fragmentShader: simplexNoise4D() + oceanFragmentShader()
  });

  skyMaterial = new THREE.ShaderMaterial({
    uniforms: skyUniforms,
    transparent: true,
    vertexShader: simplexNoise() + skyVertexShader(),
    fragmentShader: cellularNoise() + simplexNoise2D() + skyFragmentShader()
  });

      land = new THREE.Mesh( 
          new THREE.SphereBufferGeometry(20, 256, 256), 
          landMaterial 
      );
      ocean = new THREE.Mesh(
        new THREE.SphereBufferGeometry(20, 256, 256),
        oceanMaterial);
      /*sky = new THREE.Mesh(
        new THREE.SphereBufferGeometry(25, 256, 256),
        skyMaterial);*/

      scene.add(land);
      scene.add(ocean);
      //scene.add(sky);

      ocean.translateZ(-100);
      land.translateZ(-100);
      //sky.translateZ(-100);

      renderer = new THREE.WebGLRenderer();
      renderer.setSize(width, height);
      // fix transparency issue
      trackballControls = new THREE.TrackballControls(camera, container);
      trackballControls.rotateSpeed = 1.0;
      trackballControls.zoomSpeed = 1.0;
      trackballControls.panSpeed = 1.0;
      trackballControls.staticMoving = true;
      //controls.target.set(0,0,0);
      container.appendChild(renderer.domElement);


}

function render() {
  landMaterial.uniforms['time'].value = .00025 * (Date.now() - start);
  landMaterial.uniforms['mountainHeight'].value = mountainHeight.value;
  landMaterial.uniforms['islandFrequency'].value = islandFrequency.value;
  ocean.scale.x = waterLevelScale;
  ocean.scale.y = waterLevelScale;
  ocean.scale.z = waterLevelScale;
  renderer.render(scene, camera);
  trackballControls.update();
  requestAnimationFrame(render);

}

},{"../shaders/fragment/landFragmentShader.glsl":2,"../shaders/fragment/oceanFragmentShader.glsl":3,"../shaders/fragment/skyFragmentShader.glsl":4,"../shaders/noise/cellular2x2.glsl":5,"../shaders/noise/classicNoise3D.glsl":6,"../shaders/noise/classicnoise3D.glsl":7,"../shaders/noise/noise2D.glsl":8,"../shaders/noise/noise3D.glsl":9,"../shaders/noise/noise4D.glsl":10,"../shaders/vertex/landVertexShader.glsl":11,"../shaders/vertex/oceanVertexShader.glsl":12,"../shaders/vertex/skyVertexShader.glsl":13}],2:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#extension GL_OES_standard_derivatives : enable \n" +
" \n" +
"uniform vec3 lightPos; \n" +
"uniform vec3 cameraPos; \n" +
"varying vec3 pos; \n" +
"varying float elevation; \n" +
"varying vec4 vNormal; \n" +
"varying vec4 vPosition; \n" +
"varying float noise; \n" +
"varying vec2 st; \n" +
" \n" +
"const vec3 ambientColor = vec3(0.15, 0.15, 0.15); \n" +
"const vec3 diffuseColor = vec3(0.5, 0.0, 0.0); \n" +
"const vec3 specularColor = vec3(1.0, 1.0, 1.0); \n" +
"vec3 gravelColor; \n" +
"vec3 landColor; \n" +
"vec3 sandColor; \n" +
"vec3 oceanColor; \n" +
"vec3 finalColor; \n" +
"vec3 snowColor; \n" +
"vec3 landNoise; \n" +
"void initColors() { \n" +
"   float n = 0.6 * snoise(0.3*vec3(vPosition)); \n" +
"   n += 0.3 * snoise(0.6*vec3(vPosition)); \n" +
"   gravelColor = vec3(0.5, 0.5, 0.5); \n" +
"   landColor = vec3(0.0, 0.5, 0.0); \n" +
"   landNoise = 0.5*landColor; \n" +
"   gravelColor = mix(gravelColor, landNoise, clamp(n, 0.0, 1.0)); \n" +
" \n" +
"   landNoise -= 0.05 * snoise(10.0 * vec3(vPosition)); \n" +
"   landColor = mix(landColor, landNoise, clamp(n, 0.0, 1.0)); \n" +
" \n" +
"   sandColor = vec3(0.75, 0.65, 0.4); \n" +
"   oceanColor = vec3(0.1, 0.23, 0.42); \n" +
"   snowColor = vec3(1.0, 1.0, 1.0); \n" +
" \n" +
"} \n" +
"void main() { \n" +
" \n" +
"   initColors(); \n" +
"   // phong blinn model \n" +
"   vec3 newNormal = normalize(cross(dFdx(vec3(vNormal)), dFdy(vec3(vNormal)))); \n" +
"   vec3 lightDir = normalize(lightPos - vec3(vPosition)); \n" +
" \n" +
"   float lambertian = max(dot(lightDir, newNormal), 0.0); \n" +
"   float specular = 0.0; \n" +
" \n" +
"     if(lambertian > 0.0) { \n" +
"       vec3 viewDir = normalize(-vec3(newNormal)); \n" +
"       vec3 halfDir = normalize(lightDir + viewDir); \n" +
"       float specAngle = max(dot(halfDir, newNormal), 0.0); \n" +
"       specular = pow(specAngle, 16.0); \n" +
"     } \n" +
" \n" +
"   // interpolation distance \n" +
"   float interpolationDist = 0.3; \n" +
" \n" +
"   vec2 sandRange = vec2(-10.0, 0.28); \n" +
"   vec2 landRange = vec2(0.28, 0.7); \n" +
"   vec2 gravelRange = vec2(0.7, 1.0); \n" +
"   vec2 snowRange = vec2(1.0, 2.2); \n" +
" \n" +
"   // apply correct component based on elevation \n" +
"   float sand = smoothstep(sandRange.x - interpolationDist, sandRange.x, elevation) -  \n" +
"      smoothstep(sandRange.y - interpolationDist, sandRange.y, elevation); \n" +
"   float land = smoothstep(landRange.x - interpolationDist, landRange.x, elevation) -  \n" +
"      smoothstep(landRange.y - interpolationDist, landRange.y, elevation); \n" +
"   float gravel = smoothstep(gravelRange.x - interpolationDist, gravelRange.x, elevation) -  \n" +
"      smoothstep(gravelRange.y - interpolationDist, gravelRange.y, elevation); \n" +
"   float snow = smoothstep(snowRange.x - interpolationDist, snowRange.x, elevation) -  \n" +
"      smoothstep(snowRange.y - interpolationDist, snowRange.y, elevation); \n" +
"      // apply colors \n" +
"   finalColor = vec3(0.0, 0.0, 0.0); \n" +
"   //finalColor = mix(finalColor, oceanColor, ocean); \n" +
"   finalColor = mix(finalColor, sandColor, sand); \n" +
"   finalColor = mix(finalColor, landColor, land); \n" +
"   finalColor = mix(finalColor, gravelColor, gravel); \n" +
"   finalColor = mix(finalColor, snowColor, snow); \n" +
" \n" +
" \n" +
"   //gl_FragColor = vec4(ambientColor + lambertian * finalColor + specular  * specularColor, 1.0); \n" +
"   gl_FragColor = vec4(finalColor, 1.0); \n" +
" \n" +
"} \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],3:[function(require,module,exports){
module.exports = function parse(params){
      var template = "#extension GL_OES_standard_derivatives : enable \n" +
" \n" +
"uniform float time; \n" +
"varying vec4 vNormal; \n" +
"uniform vec3 lightPos; \n" +
"varying vec4 vPosition; \n" +
"const vec3 ambientColor = vec3(0.15, 0.15, 0.15); \n" +
"const vec3 diffuseColor = vec3(0.5, 0.0, 0.0); \n" +
"const vec3 specularColor = vec3(1.0, 1.0, 1.0); \n" +
"void main() \n" +
"{ \n" +
"	vec3 oceanColor = vec3(0.1, 0.23, 0.42); \n" +
" \n" +
"	vec3 newNormal = normalize(cross(dFdx(vec3(vNormal)), dFdy(vec3(vNormal)))); \n" +
"	vec3 lightDir = normalize(lightPos - vec3(vPosition)); \n" +
" \n" +
"	float lambertian = max(dot(lightDir, newNormal), 0.0); \n" +
"	float specular = 0.0; \n" +
" \n" +
"	  if(lambertian > 0.0) { \n" +
"	    vec3 viewDir = normalize(-vec3(newNormal)); \n" +
"	    vec3 halfDir = normalize(lightDir + viewDir); \n" +
"	    float specAngle = max(dot(halfDir, newNormal), 0.0); \n" +
"	    specular = pow(specAngle, 16.0); \n" +
"	  } \n" +
"	gl_FragColor = vec4(oceanColor, 1.0); \n" +
"	//gl_FragColor = vec4(ambientColor + lambertian * oceanColor + specular  * specularColor, 1.0); \n" +
" \n" +
"} \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],4:[function(require,module,exports){
module.exports = function parse(params){
      var template = "uniform vec3 lightPos; \n" +
"uniform vec3 cameraPos; \n" +
"varying vec3 pos; \n" +
"varying float elevation; \n" +
"varying vec4 vNormal; \n" +
"varying vec4 vPosition; \n" +
"varying float noise; \n" +
"varying vec2 st; \n" +
" \n" +
"void main() { \n" +
"    vec3 cloudColor = vec3(0.9, 0.9, 0.9); \n" +
"    vec2 cloudRange = vec2(-10.0, 0.8); \n" +
"    float interpolationDist = 0.3; \n" +
"    vec3 finalColor= vec3(1.0,1.0,1.0); \n" +
"    /*float clouds = smoothstep(cloudRange.x - interpolationDist, cloudRange.x, elevation) -  \n" +
"       smoothstep(cloudRange.y - interpolationDist, cloudRange.y, elevation);*/ \n" +
" \n" +
"    vec2 F = 0.7 - cellular2x2(5.0 * st);	 \n" +
"    float n = 1.5*F.x*100.0-50.0; \n" +
"    vec4 pattern = 0.1*vec4(0.7, 0.7, 0.7, 1.0); \n" +
"    pattern *= n; \n" +
"    // apply correct component based on elevation \n" +
"    /*float clouds = smoothstep(cloudRange.x - interpolationDist, cloudRange.x, 0.6) -  \n" +
"       smoothstep(cloudRange.y - interpolationDist, cloudRange.y, 0.6); \n" +
"    finalColor = mix(finalColor, cloudColor, clouds);*/ \n" +
"    gl_FragColor = vec4(finalColor, 0.2) * pattern;// pattern; \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],5:[function(require,module,exports){
module.exports = function parse(params){
      var template = "//#version 120 \n" +
" \n" +
"// Cellular noise (\"Worley noise\") in 2D in GLSL. \n" +
"// Copyright (c) Stefan Gustavson 2011-04-19. All rights reserved. \n" +
"// This code is released under the conditions of the MIT license. \n" +
"// See LICENSE file for details. \n" +
"// https://github.com/stegu/webgl-noise \n" +
" \n" +
"// Modulo 289 without a division (only multiplications) \n" +
"vec2 mod289(vec2 x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec4 mod289(vec4 x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"// Modulo 7 without a division \n" +
"vec4 mod7(vec4 x) { \n" +
"  return x - floor(x * (1.0 / 7.0)) * 7.0; \n" +
"} \n" +
" \n" +
"// Permutation polynomial: (34x^2 + x) mod 289 \n" +
"vec4 permute(vec4 x) { \n" +
"  return mod289((34.0 * x + 1.0) * x); \n" +
"} \n" +
" \n" +
"// Cellular noise, returning F1 and F2 in a vec2. \n" +
"// Speeded up by using 2x2 search window instead of 3x3, \n" +
"// at the expense of some strong pattern artifacts. \n" +
"// F2 is often wrong and has sharp discontinuities. \n" +
"// If you need a smooth F2, use the slower 3x3 version. \n" +
"// F1 is sometimes wrong, too, but OK for most purposes. \n" +
"vec2 cellular2x2(vec2 P) { \n" +
"#define K 0.142857142857 // 1/7 \n" +
"#define K2 0.0714285714285 // K/2 \n" +
"#define jitter 0.8 // jitter 1.0 makes F1 wrong more often \n" +
"	vec2 Pi = mod289(floor(P)); \n" +
" 	vec2 Pf = fract(P); \n" +
"	vec4 Pfx = Pf.x + vec4(-0.5, -1.5, -0.5, -1.5); \n" +
"	vec4 Pfy = Pf.y + vec4(-0.5, -0.5, -1.5, -1.5); \n" +
"	vec4 p = permute(Pi.x + vec4(0.0, 1.0, 0.0, 1.0)); \n" +
"	p = permute(p + Pi.y + vec4(0.0, 0.0, 1.0, 1.0)); \n" +
"	vec4 ox = mod7(p)*K+K2; \n" +
"	vec4 oy = mod7(floor(p*K))*K+K2; \n" +
"	vec4 dx = Pfx + jitter*ox; \n" +
"	vec4 dy = Pfy + jitter*oy; \n" +
"	vec4 d = dx * dx + dy * dy; // d11, d12, d21 and d22, squared \n" +
"	// Sort out the two smallest distances \n" +
"#if 0 \n" +
"	// Cheat and pick only F1 \n" +
"	d.xy = min(d.xy, d.zw); \n" +
"	d.x = min(d.x, d.y); \n" +
"	return vec2(sqrt(d.x)); // F1 duplicated, F2 not computed \n" +
"#else \n" +
"	// Do it right and find both F1 and F2 \n" +
"	d.xy = (d.x < d.y) ? d.xy : d.yx; // Swap if smaller \n" +
"	d.xz = (d.x < d.z) ? d.xz : d.zx; \n" +
"	d.xw = (d.x < d.w) ? d.xw : d.wx; \n" +
"	d.y = min(d.y, d.z); \n" +
"	d.y = min(d.y, d.w); \n" +
"	return sqrt(d.xy); \n" +
"#endif \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],6:[function(require,module,exports){
module.exports = function parse(params){
      var template = "// \n" +
"// GLSL textureless classic 3D noise \"cnoise\", \n" +
"// with an RSL-style periodic variant \"pnoise\". \n" +
"// Author:  Stefan Gustavson (stefan.gustavson@liu.se) \n" +
"// Version: 2011-10-11 \n" +
"// \n" +
"// Many thanks to Ian McEwan of Ashima Arts for the \n" +
"// ideas for permutation and gradient selection. \n" +
"// \n" +
"// Copyright (c) 2011 Stefan Gustavson. All rights reserved. \n" +
"// Distributed under the MIT license. See LICENSE file. \n" +
"// https://github.com/stegu/webgl-noise \n" +
"// \n" +
" \n" +
"vec3 mod289(vec3 x) \n" +
"{ \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec4 mod289(vec4 x) \n" +
"{ \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec4 permute(vec4 x) \n" +
"{ \n" +
"  return mod289(((x*34.0)+1.0)*x); \n" +
"} \n" +
" \n" +
"vec4 taylorInvSqrt(vec4 r) \n" +
"{ \n" +
"  return 1.79284291400159 - 0.85373472095314 * r; \n" +
"} \n" +
" \n" +
"vec3 fade(vec3 t) { \n" +
"  return t*t*t*(t*(t*6.0-15.0)+10.0); \n" +
"} \n" +
" \n" +
"// Classic Perlin noise \n" +
"float cnoise(vec3 P) \n" +
"{ \n" +
"  vec3 Pi0 = floor(P); // Integer part for indexing \n" +
"  vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1 \n" +
"  Pi0 = mod289(Pi0); \n" +
"  Pi1 = mod289(Pi1); \n" +
"  vec3 Pf0 = fract(P); // Fractional part for interpolation \n" +
"  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0 \n" +
"  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x); \n" +
"  vec4 iy = vec4(Pi0.yy, Pi1.yy); \n" +
"  vec4 iz0 = Pi0.zzzz; \n" +
"  vec4 iz1 = Pi1.zzzz; \n" +
" \n" +
"  vec4 ixy = permute(permute(ix) + iy); \n" +
"  vec4 ixy0 = permute(ixy + iz0); \n" +
"  vec4 ixy1 = permute(ixy + iz1); \n" +
" \n" +
"  vec4 gx0 = ixy0 * (1.0 / 7.0); \n" +
"  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5; \n" +
"  gx0 = fract(gx0); \n" +
"  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0); \n" +
"  vec4 sz0 = step(gz0, vec4(0.0)); \n" +
"  gx0 -= sz0 * (step(0.0, gx0) - 0.5); \n" +
"  gy0 -= sz0 * (step(0.0, gy0) - 0.5); \n" +
" \n" +
"  vec4 gx1 = ixy1 * (1.0 / 7.0); \n" +
"  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5; \n" +
"  gx1 = fract(gx1); \n" +
"  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1); \n" +
"  vec4 sz1 = step(gz1, vec4(0.0)); \n" +
"  gx1 -= sz1 * (step(0.0, gx1) - 0.5); \n" +
"  gy1 -= sz1 * (step(0.0, gy1) - 0.5); \n" +
" \n" +
"  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x); \n" +
"  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y); \n" +
"  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z); \n" +
"  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w); \n" +
"  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x); \n" +
"  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y); \n" +
"  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z); \n" +
"  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w); \n" +
" \n" +
"  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110))); \n" +
"  g000 *= norm0.x; \n" +
"  g010 *= norm0.y; \n" +
"  g100 *= norm0.z; \n" +
"  g110 *= norm0.w; \n" +
"  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111))); \n" +
"  g001 *= norm1.x; \n" +
"  g011 *= norm1.y; \n" +
"  g101 *= norm1.z; \n" +
"  g111 *= norm1.w; \n" +
" \n" +
"  float n000 = dot(g000, Pf0); \n" +
"  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz)); \n" +
"  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z)); \n" +
"  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z)); \n" +
"  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z)); \n" +
"  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z)); \n" +
"  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz)); \n" +
"  float n111 = dot(g111, Pf1); \n" +
" \n" +
"  vec3 fade_xyz = fade(Pf0); \n" +
"  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z); \n" +
"  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y); \n" +
"  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);  \n" +
"  return 2.2 * n_xyz; \n" +
"} \n" +
" \n" +
"// Classic Perlin noise, periodic variant \n" +
"float pnoise(vec3 P, vec3 rep) \n" +
"{ \n" +
"  vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period \n" +
"  vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period \n" +
"  Pi0 = mod289(Pi0); \n" +
"  Pi1 = mod289(Pi1); \n" +
"  vec3 Pf0 = fract(P); // Fractional part for interpolation \n" +
"  vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0 \n" +
"  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x); \n" +
"  vec4 iy = vec4(Pi0.yy, Pi1.yy); \n" +
"  vec4 iz0 = Pi0.zzzz; \n" +
"  vec4 iz1 = Pi1.zzzz; \n" +
" \n" +
"  vec4 ixy = permute(permute(ix) + iy); \n" +
"  vec4 ixy0 = permute(ixy + iz0); \n" +
"  vec4 ixy1 = permute(ixy + iz1); \n" +
" \n" +
"  vec4 gx0 = ixy0 * (1.0 / 7.0); \n" +
"  vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5; \n" +
"  gx0 = fract(gx0); \n" +
"  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0); \n" +
"  vec4 sz0 = step(gz0, vec4(0.0)); \n" +
"  gx0 -= sz0 * (step(0.0, gx0) - 0.5); \n" +
"  gy0 -= sz0 * (step(0.0, gy0) - 0.5); \n" +
" \n" +
"  vec4 gx1 = ixy1 * (1.0 / 7.0); \n" +
"  vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5; \n" +
"  gx1 = fract(gx1); \n" +
"  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1); \n" +
"  vec4 sz1 = step(gz1, vec4(0.0)); \n" +
"  gx1 -= sz1 * (step(0.0, gx1) - 0.5); \n" +
"  gy1 -= sz1 * (step(0.0, gy1) - 0.5); \n" +
" \n" +
"  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x); \n" +
"  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y); \n" +
"  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z); \n" +
"  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w); \n" +
"  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x); \n" +
"  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y); \n" +
"  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z); \n" +
"  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w); \n" +
" \n" +
"  vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110))); \n" +
"  g000 *= norm0.x; \n" +
"  g010 *= norm0.y; \n" +
"  g100 *= norm0.z; \n" +
"  g110 *= norm0.w; \n" +
"  vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111))); \n" +
"  g001 *= norm1.x; \n" +
"  g011 *= norm1.y; \n" +
"  g101 *= norm1.z; \n" +
"  g111 *= norm1.w; \n" +
" \n" +
"  float n000 = dot(g000, Pf0); \n" +
"  float n100 = dot(g100, vec3(Pf1.x, Pf0.yz)); \n" +
"  float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z)); \n" +
"  float n110 = dot(g110, vec3(Pf1.xy, Pf0.z)); \n" +
"  float n001 = dot(g001, vec3(Pf0.xy, Pf1.z)); \n" +
"  float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z)); \n" +
"  float n011 = dot(g011, vec3(Pf0.x, Pf1.yz)); \n" +
"  float n111 = dot(g111, Pf1); \n" +
" \n" +
"  vec3 fade_xyz = fade(Pf0); \n" +
"  vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z); \n" +
"  vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y); \n" +
"  float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);  \n" +
"  return 2.2 * n_xyz; \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],7:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"dup":6}],8:[function(require,module,exports){
module.exports = function parse(params){
      var template = "// \n" +
"// Description : Array and textureless GLSL 2D simplex noise function. \n" +
"//      Author : Ian McEwan, Ashima Arts. \n" +
"//  Maintainer : stegu \n" +
"//     Lastmod : 20110822 (ijm) \n" +
"//     License : Copyright (C) 2011 Ashima Arts. All rights reserved. \n" +
"//               Distributed under the MIT License. See LICENSE file. \n" +
"//               https://github.com/ashima/webgl-noise \n" +
"//               https://github.com/stegu/webgl-noise \n" +
"//  \n" +
" \n" +
"vec3 mod289(vec3 x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
"/* \n" +
"vec2 mod289(vec2 x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"}*/ \n" +
" \n" +
"vec3 permute(vec3 x) { \n" +
"  return mod289(((x*34.0)+1.0)*x); \n" +
"} \n" +
" \n" +
"float snoise(vec2 v) \n" +
"  { \n" +
"  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0 \n" +
"                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0) \n" +
"                     -0.577350269189626,  // -1.0 + 2.0 * C.x \n" +
"                      0.024390243902439); // 1.0 / 41.0 \n" +
"// First corner \n" +
"  vec2 i  = floor(v + dot(v, C.yy) ); \n" +
"  vec2 x0 = v -   i + dot(i, C.xx); \n" +
" \n" +
"// Other corners \n" +
"  vec2 i1; \n" +
"  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0 \n" +
"  //i1.y = 1.0 - i1.x; \n" +
"  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0); \n" +
"  // x0 = x0 - 0.0 + 0.0 * C.xx ; \n" +
"  // x1 = x0 - i1 + 1.0 * C.xx ; \n" +
"  // x2 = x0 - 1.0 + 2.0 * C.xx ; \n" +
"  vec4 x12 = x0.xyxy + C.xxzz; \n" +
"  x12.xy -= i1; \n" +
" \n" +
"// Permutations \n" +
"  i = mod289(i); // Avoid truncation effects in permutation \n" +
"  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) \n" +
"		+ i.x + vec3(0.0, i1.x, 1.0 )); \n" +
" \n" +
"  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0); \n" +
"  m = m*m ; \n" +
"  m = m*m ; \n" +
" \n" +
"// Gradients: 41 points uniformly over a line, mapped onto a diamond. \n" +
"// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287) \n" +
" \n" +
"  vec3 x = 2.0 * fract(p * C.www) - 1.0; \n" +
"  vec3 h = abs(x) - 0.5; \n" +
"  vec3 ox = floor(x + 0.5); \n" +
"  vec3 a0 = x - ox; \n" +
" \n" +
"// Normalise gradients implicitly by scaling m \n" +
"// Approximation of: m *= inversesqrt( a0*a0 + h*h ); \n" +
"  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h ); \n" +
" \n" +
"// Compute final noise value at P \n" +
"  vec3 g; \n" +
"  g.x  = a0.x  * x0.x  + h.x  * x0.y; \n" +
"  g.yz = a0.yz * x12.xz + h.yz * x12.yw; \n" +
"  return 130.0 * dot(m, g); \n" +
"} \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],9:[function(require,module,exports){
module.exports = function parse(params){
      var template = "// \n" +
"// Description : Array and textureless GLSL 2D/3D/4D simplex  \n" +
"//               noise functions. \n" +
"//      Author : Ian McEwan, Ashima Arts. \n" +
"//  Maintainer : stegu \n" +
"//     Lastmod : 20110822 (ijm) \n" +
"//     License : Copyright (C) 2011 Ashima Arts. All rights reserved. \n" +
"//               Distributed under the MIT License. See LICENSE file. \n" +
"//               https://github.com/ashima/webgl-noise \n" +
"//               https://github.com/stegu/webgl-noise \n" +
"//  \n" +
" \n" +
"vec3 mod289(vec3 x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec4 mod289(vec4 x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; \n" +
"} \n" +
" \n" +
"vec4 permute(vec4 x) { \n" +
"     return mod289(((x*34.0)+1.0)*x); \n" +
"} \n" +
" \n" +
"vec4 taylorInvSqrt(vec4 r) \n" +
"{ \n" +
"  return 1.79284291400159 - 0.85373472095314 * r; \n" +
"} \n" +
" \n" +
"float snoise(vec3 v) \n" +
"  {  \n" +
"  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ; \n" +
"  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0); \n" +
" \n" +
"// First corner \n" +
"  vec3 i  = floor(v + dot(v, C.yyy) ); \n" +
"  vec3 x0 =   v - i + dot(i, C.xxx) ; \n" +
" \n" +
"// Other corners \n" +
"  vec3 g = step(x0.yzx, x0.xyz); \n" +
"  vec3 l = 1.0 - g; \n" +
"  vec3 i1 = min( g.xyz, l.zxy ); \n" +
"  vec3 i2 = max( g.xyz, l.zxy ); \n" +
" \n" +
"  //   x0 = x0 - 0.0 + 0.0 * C.xxx; \n" +
"  //   x1 = x0 - i1  + 1.0 * C.xxx; \n" +
"  //   x2 = x0 - i2  + 2.0 * C.xxx; \n" +
"  //   x3 = x0 - 1.0 + 3.0 * C.xxx; \n" +
"  vec3 x1 = x0 - i1 + C.xxx; \n" +
"  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y \n" +
"  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y \n" +
" \n" +
"// Permutations \n" +
"  i = mod289(i);  \n" +
"  vec4 p = permute( permute( permute(  \n" +
"             i.z + vec4(0.0, i1.z, i2.z, 1.0 )) \n" +
"           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))  \n" +
"           + i.x + vec4(0.0, i1.x, i2.x, 1.0 )); \n" +
" \n" +
"// Gradients: 7x7 points over a square, mapped onto an octahedron. \n" +
"// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294) \n" +
"  float n_ = 0.142857142857; // 1.0/7.0 \n" +
"  vec3  ns = n_ * D.wyz - D.xzx; \n" +
" \n" +
"  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7) \n" +
" \n" +
"  vec4 x_ = floor(j * ns.z); \n" +
"  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N) \n" +
" \n" +
"  vec4 x = x_ *ns.x + ns.yyyy; \n" +
"  vec4 y = y_ *ns.x + ns.yyyy; \n" +
"  vec4 h = 1.0 - abs(x) - abs(y); \n" +
" \n" +
"  vec4 b0 = vec4( x.xy, y.xy ); \n" +
"  vec4 b1 = vec4( x.zw, y.zw ); \n" +
" \n" +
"  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0; \n" +
"  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0; \n" +
"  vec4 s0 = floor(b0)*2.0 + 1.0; \n" +
"  vec4 s1 = floor(b1)*2.0 + 1.0; \n" +
"  vec4 sh = -step(h, vec4(0.0)); \n" +
" \n" +
"  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ; \n" +
"  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ; \n" +
" \n" +
"  vec3 p0 = vec3(a0.xy,h.x); \n" +
"  vec3 p1 = vec3(a0.zw,h.y); \n" +
"  vec3 p2 = vec3(a1.xy,h.z); \n" +
"  vec3 p3 = vec3(a1.zw,h.w); \n" +
" \n" +
"//Normalise gradients \n" +
"  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3))); \n" +
"  p0 *= norm.x; \n" +
"  p1 *= norm.y; \n" +
"  p2 *= norm.z; \n" +
"  p3 *= norm.w; \n" +
" \n" +
"// Mix final noise value \n" +
"  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0); \n" +
"  m = m * m; \n" +
"  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),  \n" +
"                                dot(p2,x2), dot(p3,x3) ) ); \n" +
"  } \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],10:[function(require,module,exports){
module.exports = function parse(params){
      var template = "// \n" +
"// Description : Array and textureless GLSL 2D/3D/4D simplex  \n" +
"//               noise functions. \n" +
"//      Author : Ian McEwan, Ashima Arts. \n" +
"//  Maintainer : stegu \n" +
"//     Lastmod : 20110822 (ijm) \n" +
"//     License : Copyright (C) 2011 Ashima Arts. All rights reserved. \n" +
"//               Distributed under the MIT License. See LICENSE file. \n" +
"//               https://github.com/ashima/webgl-noise \n" +
"//               https://github.com/stegu/webgl-noise \n" +
"//  \n" +
" \n" +
"vec4 mod289(vec4 x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; } \n" +
" \n" +
"float mod289(float x) { \n" +
"  return x - floor(x * (1.0 / 289.0)) * 289.0; } \n" +
" \n" +
"vec4 permute(vec4 x) { \n" +
"     return mod289(((x*34.0)+1.0)*x); \n" +
"} \n" +
" \n" +
"float permute(float x) { \n" +
"     return mod289(((x*34.0)+1.0)*x); \n" +
"} \n" +
" \n" +
"vec4 taylorInvSqrt(vec4 r) \n" +
"{ \n" +
"  return 1.79284291400159 - 0.85373472095314 * r; \n" +
"} \n" +
" \n" +
"float taylorInvSqrt(float r) \n" +
"{ \n" +
"  return 1.79284291400159 - 0.85373472095314 * r; \n" +
"} \n" +
" \n" +
"vec4 grad4(float j, vec4 ip) \n" +
"  { \n" +
"  const vec4 ones = vec4(1.0, 1.0, 1.0, -1.0); \n" +
"  vec4 p,s; \n" +
" \n" +
"  p.xyz = floor( fract (vec3(j) * ip.xyz) * 7.0) * ip.z - 1.0; \n" +
"  p.w = 1.5 - dot(abs(p.xyz), ones.xyz); \n" +
"  s = vec4(lessThan(p, vec4(0.0))); \n" +
"  p.xyz = p.xyz + (s.xyz*2.0 - 1.0) * s.www;  \n" +
" \n" +
"  return p; \n" +
"  } \n" +
"						 \n" +
"// (sqrt(5) - 1)/4 = F4, used once below \n" +
"#define F4 0.309016994374947451 \n" +
" \n" +
"float snoise(vec4 v) \n" +
"  { \n" +
"  const vec4  C = vec4( 0.138196601125011,  // (5 - sqrt(5))/20  G4 \n" +
"                        0.276393202250021,  // 2 * G4 \n" +
"                        0.414589803375032,  // 3 * G4 \n" +
"                       -0.447213595499958); // -1 + 4 * G4 \n" +
" \n" +
"// First corner \n" +
"  vec4 i  = floor(v + dot(v, vec4(F4)) ); \n" +
"  vec4 x0 = v -   i + dot(i, C.xxxx); \n" +
" \n" +
"// Other corners \n" +
" \n" +
"// Rank sorting originally contributed by Bill Licea-Kane, AMD (formerly ATI) \n" +
"  vec4 i0; \n" +
"  vec3 isX = step( x0.yzw, x0.xxx ); \n" +
"  vec3 isYZ = step( x0.zww, x0.yyz ); \n" +
"//  i0.x = dot( isX, vec3( 1.0 ) ); \n" +
"  i0.x = isX.x + isX.y + isX.z; \n" +
"  i0.yzw = 1.0 - isX; \n" +
"//  i0.y += dot( isYZ.xy, vec2( 1.0 ) ); \n" +
"  i0.y += isYZ.x + isYZ.y; \n" +
"  i0.zw += 1.0 - isYZ.xy; \n" +
"  i0.z += isYZ.z; \n" +
"  i0.w += 1.0 - isYZ.z; \n" +
" \n" +
"  // i0 now contains the unique values 0,1,2,3 in each channel \n" +
"  vec4 i3 = clamp( i0, 0.0, 1.0 ); \n" +
"  vec4 i2 = clamp( i0-1.0, 0.0, 1.0 ); \n" +
"  vec4 i1 = clamp( i0-2.0, 0.0, 1.0 ); \n" +
" \n" +
"  //  x0 = x0 - 0.0 + 0.0 * C.xxxx \n" +
"  //  x1 = x0 - i1  + 1.0 * C.xxxx \n" +
"  //  x2 = x0 - i2  + 2.0 * C.xxxx \n" +
"  //  x3 = x0 - i3  + 3.0 * C.xxxx \n" +
"  //  x4 = x0 - 1.0 + 4.0 * C.xxxx \n" +
"  vec4 x1 = x0 - i1 + C.xxxx; \n" +
"  vec4 x2 = x0 - i2 + C.yyyy; \n" +
"  vec4 x3 = x0 - i3 + C.zzzz; \n" +
"  vec4 x4 = x0 + C.wwww; \n" +
" \n" +
"// Permutations \n" +
"  i = mod289(i);  \n" +
"  float j0 = permute( permute( permute( permute(i.w) + i.z) + i.y) + i.x); \n" +
"  vec4 j1 = permute( permute( permute( permute ( \n" +
"             i.w + vec4(i1.w, i2.w, i3.w, 1.0 )) \n" +
"           + i.z + vec4(i1.z, i2.z, i3.z, 1.0 )) \n" +
"           + i.y + vec4(i1.y, i2.y, i3.y, 1.0 )) \n" +
"           + i.x + vec4(i1.x, i2.x, i3.x, 1.0 )); \n" +
" \n" +
"// Gradients: 7x7x6 points over a cube, mapped onto a 4-cross polytope \n" +
"// 7*7*6 = 294, which is close to the ring size 17*17 = 289. \n" +
"  vec4 ip = vec4(1.0/294.0, 1.0/49.0, 1.0/7.0, 0.0) ; \n" +
" \n" +
"  vec4 p0 = grad4(j0,   ip); \n" +
"  vec4 p1 = grad4(j1.x, ip); \n" +
"  vec4 p2 = grad4(j1.y, ip); \n" +
"  vec4 p3 = grad4(j1.z, ip); \n" +
"  vec4 p4 = grad4(j1.w, ip); \n" +
" \n" +
"// Normalise gradients \n" +
"  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3))); \n" +
"  p0 *= norm.x; \n" +
"  p1 *= norm.y; \n" +
"  p2 *= norm.z; \n" +
"  p3 *= norm.w; \n" +
"  p4 *= taylorInvSqrt(dot(p4,p4)); \n" +
" \n" +
"// Mix contributions from the five corners \n" +
"  vec3 m0 = max(0.6 - vec3(dot(x0,x0), dot(x1,x1), dot(x2,x2)), 0.0); \n" +
"  vec2 m1 = max(0.6 - vec2(dot(x3,x3), dot(x4,x4)            ), 0.0); \n" +
"  m0 = m0 * m0; \n" +
"  m1 = m1 * m1; \n" +
"  return 49.0 * ( dot(m0*m0, vec3( dot( p0, x0 ), dot( p1, x1 ), dot( p2, x2 ))) \n" +
"               + dot(m1*m1, vec2( dot( p3, x3 ), dot( p4, x4 ) ) ) ) ; \n" +
" \n" +
"  } \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],11:[function(require,module,exports){
module.exports = function parse(params){
      var template = " \n" +
"uniform float time; \n" +
"uniform float altitude; \n" +
"uniform float mountainHeight; \n" +
"uniform float islandFrequency; \n" +
"varying float noise; \n" +
"varying vec2 st; \n" +
"varying float elevation; \n" +
"varying vec3 pos; \n" +
" \n" +
" \n" +
"varying vec4 vPosition; \n" +
"varying vec4 vNormal; \n" +
" \n" +
"void main() { \n" +
"    st = uv; \n" +
"    vPosition = modelMatrix * vec4(position, 1.0); \n" +
"    vNormal = modelMatrix * vec4(normal, 1.0); \n" +
" \n" +
"    elevation = 0.0; \n" +
"    for (float i = 1.0; i < 10.0; i++) { \n" +
"        elevation+= mountainHeight* (1.0/(i*2.0)) * snoise(islandFrequency*(i/50.0)*vec3(vPosition)); \n" +
"    } \n" +
" \n" +
"    vPosition = vPosition + vNormal * 0.2 * elevation; \n" +
" \n" +
"    elevation = elevation * -1.0; \n" +
" \n" +
"    gl_Position = projectionMatrix * viewMatrix * vPosition; \n" +
" \n" +
"} \n" +
" \n" +
" \n" +
" \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],12:[function(require,module,exports){
module.exports = function parse(params){
      var template = "uniform float time; \n" +
"varying vec4 vNormal; \n" +
"varying float noise; \n" +
"varying vec2 st; \n" +
"varying vec3 pos; \n" +
"varying vec4 vPosition; \n" +
" \n" +
"void main() { \n" +
"    st = uv; \n" +
"    vNormal = modelMatrix * vec4(normal, 1.0); \n" +
"    vPosition = modelMatrix * vec4(position, 1.0); \n" +
" \n" +
"    noise = snoise(0.1*vec4(position, time)); \n" +
"    pos = position + normal*noise; \n" +
"    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0); \n" +
"     \n" +
"} \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}],13:[function(require,module,exports){
module.exports = function parse(params){
      var template = "uniform float altitude; \n" +
"uniform float height; \n" +
"uniform float cloudFrequency; \n" +
"varying float noise; \n" +
"varying vec2 st; \n" +
"varying float elevation; \n" +
"varying vec3 pos; \n" +
" \n" +
"varying vec4 vPosition; \n" +
"varying vec4 vNormal; \n" +
"void main() { \n" +
"    st = uv; \n" +
"    vPosition = modelMatrix * vec4(position, 1.0); \n" +
"    vNormal = modelMatrix * vec4(normal, 1.0); \n" +
" \n" +
" \n" +
"    vPosition = vPosition + vNormal *0.1*snoise(0.09*vec3(vPosition)); \n" +
"    gl_Position = projectionMatrix * viewMatrix * vPosition; \n" +
"} \n" 
      params = params || {}
      for(var key in params) {
        var matcher = new RegExp("{{"+key+"}}","g")
        template = template.replace(matcher, params[key])
      }
      return template
    };

},{}]},{},[1]);
