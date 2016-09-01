//browserify -t browserify-shader main.js -o bundle.js
var container, 
    renderer, 
    scene, 
    camera, 
    land,
    ocean, 
    start = Date.now(),
    fov = 30,
    mountainHeight = {
      type: "f",
      value: 2.0
    },
    mountainFrequency = {
      type: "f",
      value: 5.0
    },
    waterLevelScale = 1;

var width = window.innerWidth - 100;
var height = window.innerHeight - 100;
// Vertex shaders
var landVertexShader = require("../shaders/vertex/landVertexShader.glsl");
var oceanVertexShader = require("../shaders/vertex/oceanVertexShader.glsl")
// Fragment shaders
var landFragmentShader = require("../shaders/fragment/landFragmentShader.glsl");
var oceanFragmentShader = require("../shaders/fragment/oceanFragmentShader.glsl");
// noise functions
var noise = require("../shaders/noise/classicNoise3D.glsl");
var simplexNoise = require("../shaders/noise/noise3D.glsl");
var simplexNoise4D = require("../shaders/noise/noise4D.glsl");
var classicNoise = require("../shaders/noise/classicnoise3D.glsl");
var cellularNoise = require("../shaders/noise/cellular3D.glsl");
// onchange functions
$(document).ready(function(){
  $("#mountain-height-slider").on("input", function() {
    mountainHeight.value = $(this).val();
  });
  $("#mountain-frequency-slider").on("input", function() {
    mountainFrequency.value = $(this).val();
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
    mountainHeight: mountainHeight,
    mountainFrequency: mountainFrequency,
    derivatives: true
  }

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
      
      // create a sphere and assign the material
      land = new THREE.Mesh( 
          new THREE.SphereBufferGeometry(20, 256, 256), 
          landMaterial 
      );
      ocean = new THREE.Mesh(
        new THREE.SphereBufferGeometry(20, 256, 256),
        oceanMaterial);
      scene.add(land);
      scene.add(ocean);

      ocean.translateZ(-100);
      land.translateZ(-100);

      // create the renderer and attach it to the DOM
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(width, height);
      trackballControls = new THREE.TrackballControls(camera, container);
      trackballControls.rotateSpeed = 1.0;
      trackballControls.zoomSpeed = 1.0;
      trackballControls.panSpeed = 1.0;
      trackballControls.staticMoving = true;
      //controls.target.set(0,0,0);
      container.appendChild(renderer.domElement);
      console.log(ocean.geometry.attributes.radius);


}

function render() {
  landMaterial.uniforms['time'].value = .00025 * (Date.now() - start);
  landMaterial.uniforms['mountainHeight'].value = mountainHeight.value;
  landMaterial.uniforms['mountainFrequency'].value = mountainFrequency.value;
  ocean.scale.x = waterLevelScale;
  ocean.scale.y = waterLevelScale;
  ocean.scale.z = waterLevelScale;
  renderer.render(scene, camera);
  trackballControls.update();
  requestAnimationFrame(render);

}
