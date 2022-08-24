import {ElementModel} from "./element-model";
import {EmptyElement, NodeItem} from "./interfaces";

export class EmptyElementModel extends ElementModel implements EmptyElement {
    override readonly getFillerOffset = () => null

    override _insertChild(index: number, items: NodeItem | Iterable<NodeItem>): number {
        if(items && (this.docTools.isNode(items) || Array.from(items as Iterable<NodeItem>).length > 0)) {
            throw this.docTools.utils.getError("view-emptyelement-cannot-add", [this, items])
        }
        return 0
    }

    override is(type: string, name?: string): boolean {
        if(!name) {
            return ['emptyElement', 'view:emptyElement', 'element', 'view:element', 'node', 'view:node'].includes(type)
        }

        return name === this.name && ['emptyElement', 'view:emptyElement', 'element', 'view:element'].includes(type)
    }
}
