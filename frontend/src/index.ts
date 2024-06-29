import '../assets/styles.css';
import EngineManager from "kneekeetah-game-engine/EngineManager";
import Camera from "kneekeetah-game-engine/models/Camera";
import RenderService from "kneekeetah-game-engine/services/RenderService";
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
