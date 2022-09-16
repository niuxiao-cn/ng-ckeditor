import {Node} from "./node";
import {
    ChildrenImpl,
    IndexImpl,
    NodeAttributes,
    ParentImpl,
    ChildrenOffsetImpl, ChildItem, ParentItem
} from "./api/node";
import {Tools} from "./api/tools"

export class Element extends Node implements ChildrenImpl, ParentImpl, IndexImpl, ChildrenOffsetImpl{
    override type = new Set(["element", "model: element"])
    private children: ChildItem[] = []
    parent: ParentItem | null = null

    constructor(public tools: Tools, name: string, attrs?: NodeAttributes, children?: string | ChildItem | Iterable<string | ChildItem>) {
        super(tools.utils, attrs);
        this.name = name;
        if(children) {
            this.insertChild(0, children)
        }
    }

    get index(): number | null {
        return this.tools.getNodePos(this.parent,(parent) => parent.getChildIndex(this))
    }

    get offsetSize(): number {
        return 1
    }

    get startOffset(): number | null {
        return this.tools.getNodePos(this.parent as ChildrenOffsetImpl, parent => parent.getChildStartOffset(this))
    }

    get endOffset(): number | null {
        return this.tools.getNodePos(this.parent, () => this.startOffset ? this.startOffset + this.offsetSize : null)
    }

    get childCount(): number {
        return this.children.length
    }

    get maxOffset(): number {
        return this.tools.getOffset(this.children);
    }

    get isEmpty(): boolean {
        return this.childCount === 0
    }

    get root(): ParentItem {
        let root = this.parent
        while(root && "parent" in root) {
            root = root.parent
        }
        return root ?? this
    }

    getPath(): number[] {
       return this.tools.getNodePath(this);
    }

    nextSibling(): ChildItem | null {
        return this.tools.nodeNextSibling(this);
    }

    previousSibling(): ChildItem | null {
        return this.tools.nodePreviousSibling(this);
    }

    getChild(index: number): ChildItem | null{
        return this.children[index] ?? null
    }

    getChildren(): Iterable<ChildItem> {
        return this.children
    }

    getChildIndex(item: ChildItem): number | null {
        const index = this.children.indexOf(item)
        return index === -1 ? null : index
    }

    getChildStartOffset(item: ChildItem): number | null {
        const index = this.getChildIndex(item)
        if(index === null) {
            return null
        }
        return this.tools.getOffset(this.children.slice(0, index))
    }

    indexToOffset(index: number): number {
        if(index === this.children.length) {
            return this.maxOffset;
        }
        const item = this.getChild(index);
        if(item) {
            const offset = this.getChildStartOffset(item);
            if(offset) {
                return offset;
            }
        }
        throw this.utils.getError("model-nodelist-index-out-of-bounds", this);
    }

    offsetToIndex(offset: number): number {
        return this.tools.offsetToIndex(this, offset);
    }

    insertChild(index: number, item: ChildItem | string | Iterable<ChildItem | string>) {
        this.tools.insertChild(this, index, item);
    }

    appendChild(item: ChildItem | string | Iterable<ChildItem| string>) {
        this.insertChild(this.childCount, item);
    }

    removeChildren(index: number, howMany = 1): ChildItem[] {
        return this.tools.removeChildren(this, index, howMany);
    }

    clearChildren() {
        this.removeChildren(0, this.children.length)
    }

}
