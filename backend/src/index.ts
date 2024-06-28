import SocketManager from "./socket";
import express, {Express} from 'express';
import cors from 'cors';

function startApp() {
    const app = express();
    const socketManager = new SocketManager(app);
}
startApp();
