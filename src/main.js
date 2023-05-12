import "../style.css";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import * as dat from "lil-gui";
import fragmentShader from "./shaders/fragment.glsl";
import vertexShader from "./shaders/vertex.glsl";
import vertexPars from "./shaders/vertex_pars.glsl";
import vertexMain from "./shaders/vertex_main.glsl";
import fragmentMain from "./shaders/fragment_main.glsl";
import fragmentPars from "./shaders/fragment_pars.glsl";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// lighting
const dirLight = new THREE.DirectionalLight("#c9356e", 0.5);
dirLight.position.set(2, 2, 2);

const ambientLight = new THREE.AmbientLight("#741b47", 0.5);
scene.add(dirLight, ambientLight);

const geometry = new THREE.IcosahedronGeometry(1, 400);
const material = new THREE.MeshStandardMaterial({
  onBeforeCompile: (shader) => {
    // подготавливаем шейдерный объект
    material.userData.shader = shader;

    // юниформ
    shader.uniforms.uTime = { value: 0 };

    const parsVertexString = /* glsl */ `#include <displacementmap_pars_vertex>`;
    shader.vertexShader = shader.vertexShader.replace(
      parsVertexString,
      parsVertexString + "\n" + vertexPars
    );

    const mainVertexString = /* glsl */ `#include <displacementmap_vertex>`;
    shader.vertexShader = shader.vertexShader.replace(
      mainVertexString,
      mainVertexString + "\n" + vertexMain
    );

    const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`;
    const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`;
    shader.fragmentShader = shader.fragmentShader.replace(
      parsFragmentString,
      parsFragmentString + "\n" + fragmentPars
    );
    shader.fragmentShader = shader.fragmentShader.replace(
      mainFragmentString,
      mainFragmentString + "\n" + fragmentMain
    );
  },
});
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});

renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/* Postprocessing */

const renderPass = new RenderPass(scene, camera);
const composer = new EffectComposer(renderer);
composer.addPass(renderPass);
composer.addPass(
  new UnrealBloomPass(
    new THREE.Vector2(sizes.width, sizes.height),
    1.6,
    0.1,
    0.1
  )
);

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  if (material.userData.shader) {
    material.userData.shader.uniforms.uTime.value = elapsedTime;
  }
  // Update controls
  controls.update();

  // Render
  composer.render();
  // renderer.render(scene, camera);
  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();
