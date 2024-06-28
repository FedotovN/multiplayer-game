import Agent, { AgentProperties } from "../Agent";
import { GameObjectOptions } from "engine/models/GameObject";
import PolygonMesh from "engine/models/Mesh/PolygonMesh";
import Rigidbody from "engine/models/components/Rigidbody";
import Collider from "engine/models/components/Collider";
import MeshRenderer from "engine/models/components/MeshRenderer";
import SquareShape from "engine/models/Shape/SquareShape";

interface PlayerProperties {
    color: [number, number, number],
}

export default class Player extends Agent {
    constructor(props: PlayerProperties & AgentProperties & GameObjectOptions) {
        super(props);
        this.id = 'player';
        const shape = new SquareShape({ scale: 1, size: 20 });
        const collider = new Collider({ shape });
        const mr = new MeshRenderer();
        mr.mesh = new PolygonMesh({ shape, strokeStyle: 'transparent' });
        const [red, green, blue] = props.color;
        mr.mesh.fillStyle = `rgb(${red}, ${green}, ${blue})`;
        const rigidbody = new Rigidbody({ });

        this.setComponent(collider);
        this.setComponent(mr);
        this.setComponent(rigidbody);
    }

}
