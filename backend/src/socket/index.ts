import { Server } from 'socket.io';
import express, { Express } from 'express';
import http from 'http';
import environment from "../utils/environment";
import randomRgb from "../utils/randomRgb";
import PlayerDTO, { BackendPlayersResponse } from "../DTOs/PlayerDTO";
import Vector from "kneekeetah-game-engine/models/Vector";
import Player from "../models/entities/Player";
import Rigidbody from "kneekeetah-game-engine/models/components/Rigidbody";
import PhysicsService from "kneekeetah-game-engine/services/PhysicsService";

const { PORT, CORS_ALLOW } = environment();

export default class SocketManager {
    websocket: Server;
    users: BackendPlayersResponse = {};
    players: { [key: string]: Player } = {};
    userSpeed = 5;
    private _tickrate = 15;
    private _serverStartupTimestamp = 0;
    private _deltaTime = 0;
    private _lastTimestamp = 0;
    private _perfectFramerate = 60;
    constructor(expressServer: Express) {
        const app = express();
        const server = http.createServer(app);
        this.websocket = new Server(server, {
            pingTimeout: 5000,
            pingInterval: 2000,
            cors: {
                origin: CORS_ALLOW,
            }
        });
        server.listen(PORT, () => {
            console.log('Socket server has started on port', PORT);
            this._setupSocketListeners();
            this._sendUsersState()
            this._startUpdate();
        });}
    private _startUpdate() {
        this._serverStartupTimestamp = Date.now();
        setInterval(() => {
            this._sendUsersState();
            const timestamp = process.uptime() * 1000;
            this._deltaTime = (timestamp - this._lastTimestamp) / (1000 / this._perfectFramerate);
            this._lastTimestamp = timestamp;
        }, this._tickrate);
    }
    private _setupSocketListeners() {
        this.websocket.on('connection', (connection) => {
            this._addUserToTheGame(connection);
            console.log('users amount', Object.keys(this.users).length);
            connection.on('disconnect', (reason) => this._handleUserDisconnect(reason, connection));
            connection.on('new_movement_target', (target) => this._handleUserMovement(target, connection));
        });
    }
    private _updatePlayersPosition() {
        for (const id in this.users) {
            const user = this.users[id];
            const player = this.players[id];
            const rb = player.getComponent('rigibody') as Rigidbody;
            if (!user.targets.length) continue;
            const [currTarget] = user.targets;
            const currPos = new Vector(user.translate.position.x, user.translate.position.y);
            const movementVector = new Vector(currTarget.x - currPos.x, currTarget.y - currPos.y);
            const { x: nextX, y: nextY} = movementVector
                .normalize()
                .scale(this.userSpeed)

            const n = new Vector((rb.velocity.x + nextX) * this._deltaTime, (rb.velocity.y + nextY) * this._deltaTime);
            if (Vector.distance(movementVector, currPos) < 10) {
                user.targets.shift();
                continue;
            }
            console.log(movementVector.getLength(), n.getLength());
            if (movementVector.getLength() < n.getLength()) {
                console.log('overstepped');
                user.translate.position.x = currTarget.x;
                user.translate.position.y = currTarget.y;
                user.targets.shift();
                continue;
            }
            rb.push(nextX, nextY);
            rb.friction = .35;
            PhysicsService.move(this._deltaTime);
            user.translate.position = player.translate.position.copy();
            console.log(user.translate.position)
        }
    }
    private _handleUserMovement(target, connection) {
        const userToMove = this.users[connection.id];
        userToMove.targets.push(target);
    }
    private _addUserToTheGame(connection: Server) {
        const { id } = connection;
        const newUser = {
            id,
            translate: {
                position: new Vector(Math.random() * 500, Math.random() * 500),
            },
            color: randomRgb(),
            targets: []
        } as PlayerDTO;
        this.users[id] = newUser;
        const player = new Player({ color: newUser.color, health: 5, maxHealth: 5 });
        this.players[id] = player;
        player.translate.position = newUser.translate.position.copy()
        player.instantiate();
        this._sendUsersState();
        console.log('Someone connected', id);
    }
    private _sendUsersState() {
        this._updatePlayersPosition();
        this.websocket.emit('update_players', this.users as any);
    }
    private _handleUserDisconnect(reason: string, connection) {
        console.log(`User ${connection.id} disconnected for reason`, reason);
        delete this.users[connection.id];
        this.players[connection.id].destroy();
        delete this.players[connection.id];
        this._sendUsersState();
    }
}
