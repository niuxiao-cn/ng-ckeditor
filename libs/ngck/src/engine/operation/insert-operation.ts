// import {Operation} from "./operation";
// import {ChildItem, CloneImpl, IndexImpl, InsertOperationImpl, PositionItem} from "../api/node";
// import {Tools} from "../api/tools";
//
// export class InsertOperation extends Operation implements InsertOperationImpl {
//     public position: PositionItem & CloneImpl;
//     public nodes: ChildItem[];
//     public shouldReceiveAttributes = false
//
//     constructor(private tools: Tools, position: PositionItem & CloneImpl, nodes: string | ChildItem | Iterable<string | ChildItem>, version: number) {
//         super(version);
//         this.position = position.clone();
//         this.position.stickiness = "toNone";
//
//         this.nodes = this.tools.normalizeNodes(nodes);
//     }
//
//     get type(): "insert" {
//         return "insert"
//     }
//
//     get howMany(): number {
//         return this.tools.getOffset(this.nodes);
//     }
//
//     // override getReversed(): Move {
//     //     return undefined;
//     // }
//
//     override validate() {
//         const targetElement = this.position.parent;
//         if(!targetElement || targetElement.maxOffset < this.position.offset) {
//             throw this.tools.utils.getError("insert-operation-position-invalid", this);
//         }
//     }
//
//     override execute() {
//         const originalNodes = this.nodes;
//     }
// }
