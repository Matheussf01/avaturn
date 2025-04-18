
import * as THREE from './libs/three.module.js';
import { GLTFLoader } from './libs/GLTFLoader.js';

let scene, camera, renderer, avatar;

init();
loadAvatar();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(35, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(0, 1.6, 3);

  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const light = new THREE.HemisphereLight(0xffffff, 0x444444);
  light.position.set(0, 1, 0);
  scene.add(light);

  animate();
}

function loadAvatar() {
  const loader = new GLTFLoader();
  loader.load('model_base.glb', (gltf) => {
    avatar = gltf.scene;
    avatar.scale.set(1.5, 1.5, 1.5);
    scene.add(avatar);
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

async function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value;
  input.value = "";

  // Envia a pergunta para a OpenAI
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer sk-proj-..."
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{role: "user", content: text}]
    })
  });
  const data = await response.json();
  const reply = data.choices[0].message.content;
  console.log("GPT Resposta:", reply);

  // Envia a resposta para ElevenLabs
  const audioRes = await fetch("https://api.elevenlabs.io/v1/text-to-speech/V81pj24Ikn45xrwdfbMG/stream", {
    method: "POST",
    headers: {
      "xi-api-key": "sk_...",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: reply,
      model_id: "eleven_multilingual_v2",
      voice_settings: {stability: 0.5, similarity_boost: 0.5}
    })
  });

  const audioBlob = await audioRes.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play(); // Reproduz com lipsync básico (futuro upgrade)
}

window.sendMessage = sendMessage;
