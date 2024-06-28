import '../assets/styles.css';
import EngineManager from "engine/EngineManager";
import Camera from "engine/models/Camera";
import RenderService from "engine/services/RenderService";
import MultiplayerManager from "@/game/MultiplayerManager";

const em = new EngineManager();
const mm = new MultiplayerManager(em);
const canvas = document.getElementById('root') as HTMLCanvasElement;
const context = canvas.getContext('2d');
const camera = new Camera({
    canvas,
    context,
    height: window.innerHeight,
    width: window.innerWidth,
});
RenderService.cameras.add(camera);
em.start();
mm.connectToTheGame().then(() => {});
// const mr = player.getComponent('meshRenderer') as MeshRenderer;
// mr.mesh.fillStyle = `rgba(255, 123, 32)`;
// const targetsList: Array<Vector> = []
// let isClicking = false;
// window.addEventListener('click', (e) => {
//     targetsList.push(new Vector(e.x, e.y))
//     const pointer = new MeshRenderer();
//     pointer.mesh = new SquareMesh({ size: 10, fillStyle: 'red', strokeStyle: 'white', lineWidth: 2 });
//     pointer.mesh.translate.position.x = e.x;
//     pointer.mesh.translate.position.y = e.y;
//     pointer.mesh.translate.rotation = 45;
//     setTimeout(() => {
//         pointer.removeMesh();
//         pointer.cleanup();
//     }, 5000);
// });
// em.onUpdate((deltaTime) => {
//     const currTarget = targetsList[0];
//     if (!currTarget) return;
//     const rb = player.getComponent('rigibody') as Rigidbody;
//     const movementVector = new Vector(currTarget.x - player.translate.position.x, currTarget.y - player.translate.position.y).normalize();
//     if (Vector.distance(player.translate.position, currTarget) < 10) {
//         targetsList.shift();
//         return;
//     };
//     rb.friction = .1;
//     rb.push(movementVector.x * 2, movementVector.y * 2);
// });
