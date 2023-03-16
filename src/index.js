import * as THREE from 'three';
import { GUI } from "dat.gui";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
const wolf = require("./models/Wolf.fbx");
const character = require("./models/character.fbx");
const characterJog = require("./models/animations/Jogging.fbx");
const characterRun = require("./models/animations/Running.fbx");

const scene = new THREE.Scene();
scene.background = new THREE.Color("#aaa")
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const pointLight = new THREE.PointLight("#fff", 1, 100);
pointLight.position.set( 10, 10, 10 );
scene.add( pointLight );

const sphereSize = 1;
const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
scene.add( pointLightHelper );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const controls = new OrbitControls(camera, renderer.domElement)
controls.enableDamping = true
controls.target.set(0, 1, 0)

const ambientLight = new THREE.AmbientLight()
scene.add(ambientLight)


let mixer;
let modelReady = false;
const animationActions = []
let activeAction;
let lastAction;
const loader = new FBXLoader();

loader.load(character, function ( fbx ) {

    fbx.scale.set(0.01, 0.01, 0.01);

    mixer = new THREE.AnimationMixer(fbx);

    const animationAction = mixer.clipAction(
        (fbx).animations[0]
    )

    animationActions.push(animationAction)
    animationsFolder.add(animations, 'default')
    activeAction = animationActions[0]

    scene.add(fbx)

    loader.load(characterRun,
        (object) => {
            console.log("loaded Running")

            const animationAction = mixer.clipAction((object).animations[0]);
            animationActions.push(animationAction)
            animationsFolder.add(animations, "running")

            modelReady = true;

        }, undefined, function ( error ) {

            console.error( error );
        
        } );

}, (xhr) => {
    console.log(Math.round((xhr.loaded / xhr.total) * 100) + '% loaded')
}, function ( error ) {

	console.error( error );

} );

const animations = {
    default: function () {
        setAction(animationActions[0])
    },
    running: function () {
        setAction(animationActions[1])
    }
}

const setAction = (toAction) => {
    if (toAction != activeAction) {
        lastAction = activeAction
        activeAction = toAction
        lastAction.stop()
        lastAction.fadeOut(1)
        activeAction.reset()
        activeAction.fadeIn(1)
        activeAction.play()
    }
}

const gui = new GUI()
const animationsFolder = gui.addFolder('Animations')
animationsFolder.open()


camera.position.z = 5;

const clock = new THREE.Clock()

function animate() {
    requestAnimationFrame(animate)

    controls.update()

    if (modelReady) mixer.update(clock.getDelta())

    render()
}

function render() {
    renderer.render(scene, camera)
}

animate()