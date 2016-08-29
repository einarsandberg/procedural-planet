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
var cellularNoise = require("../shaders/noise/cellular3D.glsl");


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
    mountainHeight: {
      type: "f",
      value: 2.0
    },
    mountainFrequency: {
      type: "f",
      value: 4.0
    },
    derivatives: true
  }

  material = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: simplexNoise() + landVertexShader(),
    fragmentShader: simplexNoise() + landFragmentShader()
  });
      
      // create a sphere and assign the material
      mesh = new THREE.Mesh( 
          new THREE.SphereBufferGeometry(20, 256, 256), 
          material 
      );
      scene.add(mesh);

      mesh.translateZ(-100);

      // create the renderer and attach it to the DOM
      renderer = new THREE.WebGLRenderer();
      renderer.setSize(window.innerWidth, window.innerHeight);
      trackballControls = new THREE.TrackballControls(camera);
      trackballControls.rotateSpeed = 1.0;
              trackballControls.zoomSpeed = 1.0;
              trackballControls.panSpeed = 1.0;
              trackballControls.staticMoving = true;
      //controls.target.set(0,0,0);
      container.appendChild(renderer.domElement);

}
/*function animate() {
  requestAnimationFrame( animate );
  trackballControls.update();
}*/
function render() {
  // let there be light
  material.uniforms['time'].value = .00025 * (Date.now() - start);
  renderer.render( scene, camera );
  trackballControls.update();
  requestAnimationFrame( render );

      
  }