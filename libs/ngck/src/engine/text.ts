import {Node} from "./node";
import {
    IndexImpl,
    NodeAttributes,
    ParentImpl,
    TextImpl,
    NodeItem,
    ChildrenImpl,
    ChildrenOffsetImpl,
    NodeImpl, ChildItem
} from "./api/node";
import {Tools} from "./api/tools"

export class Text extends Node implements TextImpl, ParentImpl, IndexImpl {
    parent: (NodeItem & ChildrenImpl & ChildrenOffsetImpl) | (NodeImpl & ChildrenImpl & ChildrenOffsetImpl) | null = null;

    override type = new Set(["$text", "model:$text"]);

    constructor(public tools: Tools, public data = "", attrs?: NodeAttributes) {
        super(tools.utils, attrs);
    }

    get root(): (NodeItem & ChildrenImpl & ChildrenOffsetImpl) | (NodeImpl & ChildrenImpl & ChildrenOffsetImpl) {
        let parent = this.parent
        while (parent && "parent" in parent) {
            parent = parent.parent
        }
        if(!parent) {
            throw this.utils.getError("text-not-found-parent", this);
        }
        return parent
    }

    get index(): number | null {
        return this.tools.getNodePos(this.parent,(parent) => parent.getChildIndex(this))
    }

    get offsetSize(): number {
        return this.data.length;
    }

    get startOffset(): number | null {
        return this.tools.getNodePos(this.parent, parent => parent.getChildStartOffset(this))
    }

    get endOffset(): number | null {
        return this.tools.getNodePos(this.parent, () => this.startOffset ? this.startOffset + this.offsetSize : null)
    }

    getPath(): number[] {
        return this.tools.getNodePath(this)
    }
    nextSibling(): ChildItem | null {
        return this.tools.nodeNextSibling(this)
    }
    previousSibling(): ChildItem | null {
        return this.tools.nodePreviousSibling(this)
    }
}
