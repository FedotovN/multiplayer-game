type Vector = { x: number, y: number };
export default interface PlayerDTO {
    color: [number, number, number],
    translate: {
        position: Vector,
    },
    velocity: Vector,
    targets: Array<Vector>,
    id: string,
}
export type BackendPlayersResponse = { [key: string]: PlayerDTO };
