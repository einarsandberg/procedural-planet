//browserify -t browserify-shader main.js -o bundle.js
var container, 
    renderer, 
    scene, 
    camera, 
    mesh, 
    start = Date.now(),
    fov = 30;

// Vertex shaders
var landVertexShader = require("../shaders/vertex/landVertexShader.glsl");
var oceanVertexShader = require("../shaders/vertex/oceanVertexShader.glsl")
// Fragment shaders
var landFragmentShader = require("../shaders/fragment/landFragmentShader.glsl");
var oceanFragmentShader = require("../shaders/fragment/oceanFragmentShader.glsl");
// noise functions
var noise = require("../shaders/noise/classicNoise3D.glsl");
var simplexNoise = require("../shaders/noise/noise3d.glsl");
var classicNoise = require("../shaders/noise/classicnoise3D.glsl");


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
      window.innerWidth / window.innerHeight, 
      1, 
      10000 );
  camera.position.z = 100;
  camera.target = new THREE.Vector3( 0, 0, 0 );

  scene.add(camera);
  var uniforms = {
    time: {
          type: "f",
          value: 0.0
        }
  }

  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: classicNoise() +  landVertexShader(),
    fragmentShader: landFragmentShader()
  });
      
  var planeGeometry = new THREE.PlaneGeometry(20, 20, 300);

      // create a sphere and assign the material
      mesh = new THREE.Mesh( 
          new THREE.IcosahedronGeometry(20, 4), 
          material 
      );
      scene.add(mesh);

      mesh.translateZ(-100);

      // create the renderer and attach it to the DOM
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      container.appendChild(renderer.domElement);

}
function render() {
  // let there be light
  material.uniforms['time'].value = .00025 * (Date.now() - start);
  renderer.render( scene, camera );
  requestAnimationFrame( render );
      
  }