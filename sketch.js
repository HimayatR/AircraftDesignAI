import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { generateAircraft } from './aircraftGenerator.js';

let scene, camera, renderer, controls;
let aircraft;

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    camera.position.set(0, 2, 5);
    controls.target.set(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    animate();

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

window.generateAircraftWrapper = function() {
    if (aircraft) {
        scene.remove(aircraft);
    }

    const params = {
        aircraftType: document.getElementById("aircraftType")?.value || "default",
        wingShape: document.getElementById("wingShape")?.value || "default",
        engineCount: parseInt(document.getElementById("engineCount")?.value) || 0,
        enginePlacement: document.getElementById("enginePlacement")?.value || "default",
        tailType: document.getElementById("tailType")?.value || "default"
    };

    aircraft = generateAircraft(params);

    if (aircraft instanceof THREE.Object3D) {
        scene.add(aircraft);
    } else {
        console.error("generateAircraft did not return a valid THREE.Object3D.");
    }

    // Reset camera & controls
    camera.position.set(0, 2, 5);
    controls.target.set(0, 0, 0);
    controls.update();
};

document.addEventListener("DOMContentLoaded", function () {
    init();

    const generateButton = document.getElementById("generate");
    const animateButton = document.getElementById("animate");

    if (generateButton) {
        generateButton.addEventListener("click", window.generateAircraftWrapper);
    }
    if (animateButton) {
        animateButton.addEventListener("click", function() {
            console.log("Animate button clicked");
        });
    }
});
