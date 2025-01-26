//Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for the camera to move around the scene
import { OrbitControls } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/controls/OrbitControls.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

//Create a Three.JS Scene
const scene = new THREE.Scene();
//create a new camera with positions and angles
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 9000);

//Keep track of the mouse position, so we can make the eye move
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let mixer; // AnimationMixer для управления анимацией
let action; // Действие (анимация)
let isAnimating = false; // Состояние анимации (проигрывается или нет)
//Keep the 3D object on a global variable so we can access it later
let object;

//OrbitControls allow the camera to move around the scene
let controls;

//Set which object to render
let objToRender = 'eye';

//Instantiate a loader for the .gltf file
const loader = new GLTFLoader();

//Load the file
loader.load(
  `./models/${objToRender}/otkr1.gltf`,
  function (gltf) {
    // Добавляем модель в сцену
    object = gltf.scene;
    scene.add(object);

    // Если у модели есть анимация, настраиваем AnimationMixer
    if (gltf.animations && gltf.animations.length > 0) {
      mixer = new THREE.AnimationMixer(object);
      action = mixer.clipAction(gltf.animations[0]); // Берём первую анимацию

      // Устанавливаем анимацию в начальное положение (закрытая открытка)
      action.reset(); // Переводим на начало
      action.stop(); // Останавливаем проигрывание
      action.time = 1; // Устанавливаем время на начальный кадр
      mixer.update(1); // Принудительно обновляем состояние модели на первом кадре
      action.clampWhenFinished = true; // Оставляем объект в состоянии анимации
    }
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
  },
  function (error) {
    console.error(error);
  }
);




//Instantiate a new renderer and set its size
const renderer = new THREE.WebGLRenderer({ alpha: true }); //Alpha: true allows for the transparent background
renderer.setClearColor(0x292642, 1);
renderer.setSize(window.innerWidth, window.innerHeight);

//Add the renderer to the DOM
document.getElementById("container3D").appendChild(renderer.domElement);

//Set how far the camera will be from the 3D model
camera.position.z = objToRender === "dino" ? 25 : 500;

//Add lights to the scene, so we can actually see the 3D model
const ambientLight = new THREE.AmbientLight(0xe0a961, 0); // Мягкий окружающий свет (цвет, интенсивность)
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // Направленный свет для основной яркости
directionalLight.position.set(100, 200, 300); // Позиция света (X, Y, Z)
directionalLight.castShadow = true; // Создание мягких теней
directionalLight.shadow.mapSize.width = 1024; // Размер карты теней
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

// Точечный свет для мягкой дополнительной подсветки
const pointLight = new THREE.PointLight(0xffffff, 1, 1000); // (цвет, интенсивность, дальность)
pointLight.position.set(-200, 100, 300); // Размещение в другой части сцены
scene.add(pointLight);

//This adds controls to the camera, so we can rotate / zoom it with the mouse
if (objToRender === "dino") {
  controls = new OrbitControls(camera, renderer.domElement);
}

//Render the scene
function animate() {
  requestAnimationFrame(animate);
  //Here we could add some code to update the scene, adding some automatic movement
  if (mixer) {
    mixer.update(0.01); // Обновляем состояние анимации
  }
  //Make the eye move
  if (object && objToRender === "eye") {
    //I've played with the constants here until it looked good 
    object.rotation.y = -3 + mouseX / window.innerWidth * 3;
    object.rotation.x = -1.2 + mouseY * 2.5 / window.innerHeight;
   }
  renderer.render(scene, camera);
}

//Add a listener to the window, so we can resize the window and the camera
window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

//add mouse position listener, so we can make the eye move
document.onmousemove = (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
}
document.addEventListener("click", () => {
  if (mixer && action) {
    if (!isAnimating) {
      action.reset(1); // Переводим в начальное состояние
      action.setLoop(THREE.LoopOnce); // Однократное проигрывание
      action.clampWhenFinished = true; // Оставляем последний кадр
      action.play(); // Проигрываем анимацию
      isAnimating = true; // Фиксируем, что анимация запущена
    }
  }
});

document.addEventListener("wheel", (event) => {
  // Регулировка скорости приближения/отдаления
  const zoomSpeed = 5;

  // Обновляем позицию камеры в зависимости от прокрутки колеса
  camera.position.z += event.deltaY / zoomSpeed;

  // Устанавливаем минимальное и максимальное расстояние камеры
  camera.position.z = Math.min(Math.max(camera.position.z, 100), 1000);
});
// Создаём аудио-объект
const backgroundMusic = new Audio('./models/Herbie Hancock - Watermelon Man.mp3');

// Настраиваем параметры аудио
backgroundMusic.loop = true; // Зацикливание музыки
backgroundMusic.volume = 0.5; // Громкость (от 0 до 1)

// Запуск музыки при взаимодействии с пользователем
document.addEventListener("click", () => {
  if (backgroundMusic.paused) {
    backgroundMusic.play().catch((error) => {
      console.warn("Ошибка при запуске музыки:", error);
    });
  }
});

//Start the 3D rendering
animate();



//Start the 3D rendering
animate() ;