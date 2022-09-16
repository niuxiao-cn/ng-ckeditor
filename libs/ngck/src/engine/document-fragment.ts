import {NodeImpl, ChildrenImpl, ChildrenOffsetImpl, ChildItem} from "./api/node";
import { Tools } from "./api/tools";

export class DocumentFragment implements NodeImpl, ChildrenImpl, ChildrenOffsetImpl {
    name = ""
    type = new Set(["documentFragment", "model:documentFragment"])

    private children: ChildItem[] = []

    constructor(public tools: Tools) { }

    get childCount(): number {
        return this.children.length
    }

    get isEmpty(): boolean {
        return this.childCount === 0
    }

    get maxOffset(): number {
        return this.tools.getOffset(this.children)
    }

    getChild(index: number): ChildItem | null{
        return this.children[index] ?? null
    }

    getChildren(): Iterable<ChildItem> {
        return this.children
    }

    getChildIndex(item: ChildItem): number | null {
        const index = this.children.indexOf(item);
        return index === -1 ? null : index;
    }

    insertChild(index: number, item: ChildItem | string | Iterable<ChildItem | string>) {
        this.tools.insertChild(this, index, item);
    }

    appendChild(item: ChildItem | string | Iterable<ChildItem | string>) {
        this.insertChild(this.childCount, item);
    }

    removeChildren(index: number, howMany = 1): ChildItem[] {
        return this.tools.removeChildren(this, index, howMany)
    }

    clearChildren() {
        this.removeChildren(0, this.children.length)
    }

    getChildStartOffset(item: ChildItem): number | null {
        const index = this.getChildIndex(item)
        if(index === null) {
            return null;
        }
        return this.tools.getOffset(this.children.slice(0, index))
    }

    indexToOffset(index: number): number {
        if(index === this.children.length) {
            return this.maxOffset;
        }
        const item = this.getChild(index)
        if(item) {
            const offset = this.getChildStartOffset(item);
            if(offset) {
                return offset;
            }
        }
        throw this.tools.utils.getError("model-nodelist-index-out-of-bounds", this)
    }

    offsetToIndex(offset: number): number {
        return this.tools.offsetToIndex(this, offset);
    }
}
