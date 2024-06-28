import { io, Socket } from "socket.io-client";
import Player from "./models/entities/Player";
import PlayerDTO, { BackendPlayersResponse } from "@/game/models/DTOs/PlayerDTO";
import Vector from "engine/models/Vector";
import MeshRenderer from "engine/models/components/MeshRenderer";
import SquareMesh from "engine/models/Mesh/SquareMesh";
import Rigidbody from "engine/models/components/Rigidbody";
import EngineManager from "engine/EngineManager";

export default class MultiplayerManager {
    targetsList: Array<Vector> = [];
    players: Map<string, Player> = new Map<string, Player>();
    websocket: Socket;
    engineManager: EngineManager;
    private _socketUrl = 'ws://localhost:5000'
    constructor(engineManager: EngineManager) {
        this.engineManager = engineManager;
    }

    async connectToTheGame(): Promise<void> {
        await new Promise<void>((res) => {
            this.websocket = io(this._socketUrl);
            this._setEventListeners();
            this.websocket.on('connect', res);
            console.log('Connected to WebSocket!');
        });
        this._setupControls();
    }
    private _setupControls() {
        const player = this._getPlayer();
        window.addEventListener('click', (e) => {
            const newMovementTarget = new Vector(e.x, e.y);
            this.targetsList.push(newMovementTarget)
            this.websocket.emit('new_movement_target', newMovementTarget);
            const pointer = new MeshRenderer();
            const playerMr = player.getComponent('meshRenderer') as MeshRenderer;
            pointer.mesh = new SquareMesh({ size: 10, fillStyle: playerMr.mesh.fillStyle, strokeStyle: 'white', lineWidth: 2 });
            pointer.mesh.translate.position.x = e.x;
            pointer.mesh.translate.position.y = e.y;
            pointer.mesh.translate.rotation = 45;
            setTimeout(() => {
                pointer.removeMesh();
                pointer.cleanup();
            }, 5000);
        });
        this.engineManager.onUpdate((deltaTime) => {
            this._makePlayerStep(deltaTime);
        });

    }
    private _makePlayerStep(deltaTime: number) {
        const player = this._getPlayer();
        const currTarget = this.targetsList[0];
        if (!currTarget) return;
        const currPos = player.translate.position;
        if (Vector.distance(currPos, currTarget) < 20) {
            this.targetsList.shift();
            return;
        }
        const movementX =  currTarget.x - currPos.x;
        const movementY =  currTarget.y - currPos.y;
        const movementVector = new Vector(movementX, movementY);
        const normalizedMovement = movementVector.normalize();
        const speed = 1;
        const rb = player.getComponent('rigibody') as Rigidbody
        // rb.friction = .1;
        // rb.push(normalizedMovement.x * speed * deltaTime, normalizedMovement.y * speed * deltaTime);
        // player.translate.position.x += normalizedMovement.x * speed * deltaTime;
        // player.translate.position.y += normalizedMovement.y * speed * deltaTime;
    }
    private _setEventListeners() {
        this.websocket.on('update_players', (players) => this._handlePlayersUpdate(players));
    }
    private _handlePlayersUpdate(backendPlayers: BackendPlayersResponse) {
        for (const backendId in backendPlayers) {
            const dto = backendPlayers[backendId];
            if (this.players.get(backendId)) {
                const p = this.players.get(backendId);

                p.translate.position.x = dto.translate.position.x;
                p.translate.position.y = dto.translate.position.y;
            } else {
                this._addPlayer(dto);
            }

        }
        this.players.forEach((player, id) => {
            if (!backendPlayers[id]) {
                console.log('there`s no player with id', id);
                this.players.get(id).destroy();
                this.players.delete(id);
            }
        })
    }
    private _addPlayer(dto: PlayerDTO) {
        const { color, translate, id } = dto;
        const newPlayer = new Player({ color, health: 5, maxHealth: 5 });
        const { x, y } = translate.position
        newPlayer.translate.position = new Vector(x, y);
        newPlayer.instantiate();
        this.players.set(id, newPlayer);
    }
    private _getPlayer(): Player {
        return this.players.get(this.websocket.id);
    }
}