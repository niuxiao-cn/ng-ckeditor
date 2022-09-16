import {ChildItem, ParentItem, TextItem, TextProxyItem} from "./api/node";
import {Tools} from "./api/tools";

export class TextProxy implements TextProxyItem {
    name = "";
    readonly data: string;
    type = new Set(["$textProxy", "model:$textProxy", "textProxy", "model:textProxy"]);

    constructor(private tools: Tools, public readonly textNode: TextItem, public readonly offsetInText: number, length: number) {
        if(offsetInText < 0 || offsetInText > textNode.offsetSize) {
            throw this.tools.utils.getError("model-textproxy-wrong-offsetintext", this);
        }
        if(length < 0 || offsetInText + length > textNode.offsetSize) {
            throw this.tools.utils.getError("model-textproxy-wrong-length", this);
        }

        this.data = textNode.data.substring(offsetInText, offsetInText + length);
    }

    get index(): number | null {
        return this.tools.getNodePos(this.parent,(parent) => parent.getChildIndex(this))
    }

    get startOffset(): number | null {
        return this.textNode.startOffset !== null ? this.textNode.startOffset + this.offsetInText : null;
    }

    get offsetSize(): number {
        return this.data.length;
    }

    get endOffset(): number | null {
        return this.startOffset !== null ? this.startOffset + this.offsetSize : null;
    }

    get isPartial(): boolean {
        return this.offsetSize !== this.textNode.offsetSize;
    }

    get parent(): ParentItem | null {
        return this.textNode.parent;
    }

    get root(): ParentItem {
        return this.textNode.root
    }

    getPath(): number[] {
        const path = this.textNode.getPath();

        if(path.length > 0) {
            path[path.length - 1] += this.offsetInText;
        }
        return path;
    }

    nextSibling(): ChildItem | null {
        return this.tools.nodeNextSibling(this);
    }

    previousSibling(): ChildItem | null {
        return this.tools.nodePreviousSibling(this);
    }
}
