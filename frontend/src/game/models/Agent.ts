import GameObject, { GameObjectOptions } from "engine/models/GameObject";
export type AgentProperties = {
    health?: number,
    maxHealth: number,
} & GameObjectOptions
export default class Agent extends GameObject {
    health: number;
    maxHealth: number;
    constructor({ maxHealth, health }: AgentProperties) {
        super();
        this.maxHealth = maxHealth;
        this.health = health || maxHealth;
    }
    makeDamage(damage: number) {}
}
