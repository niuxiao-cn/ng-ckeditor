import {
    ParentItem,
    PositionItem,
    PositionStickiness,
    ElementItem, TextItem, ChildItem, PositionRelation, TreeWalkerValue, TreeWalkerOptions, CloneImpl, ParentImpl, OperationItem
} from "./api/node";
import {Tools} from "./api/tools";

export class Position implements PositionItem, CloneImpl {

    name = "";
    type = new Set(["position", "model:position"]);

    constructor(
        private tools: Tools,
        public readonly root: ParentItem,
        public path: number[],
        public stickiness: PositionStickiness = "toNone"
    ) {
        if (this.path.length === 0) {
            throw this.tools.utils.getError("model-position-path-incorrect-format", root, {path});
        }
        if (root.type.has("rootElement")) {
            this.path = this.path.slice();
        } else if (root.type.has("documentFragment")) {
            this.path = [];
        } else {
            const _root = root as ElementItem;
            this.path = [..._root.getPath(), ...this.path];
            this.root = _root.root;
        }
    }

    getTransformedByOperation(operation: OperationItem): PositionItem & CloneImpl {
        throw new Error("todo");
        //
        // let result;
        // switch (operation.type) {
        //     case "insert":
        //
        // }
        // return result;
    }

    get offset(): number {
        return this.path[this.path.length - 1];
    }

    set offset(value) {
        this.path[this.path.length - 1] = value;
    }

    get parent(): this["root"] {
        let parent = this.root;
        for(let i = 0; i < this.path.length - 1; i ++) {
            parent = parent.getChild(parent.offsetToIndex(this.path[i])) as this["root"];
        }
        if(!parent || parent.type.has("$text")) {
            throw this.tools.utils.getError("model-position-path-incorrect", this, {position: this});
        }

        return parent;
    }

    get index(): number {
        return this.parent.offsetToIndex(this.offset);
    }

    get textNode(): TextItem | null {
        return this.tools.getTextNodeAtPosition(this, this.parent);
    }

    get nodeAfter(): ChildItem | null {
        const parent = this.parent;
        return this.tools.getNodeAfterPosition(this, parent, this.tools.getTextNodeAtPosition(this, parent));
    }

    get nodeBefore():  ChildItem | null {
        const parent = this.parent;
        return this.tools.getNodeBeforePosition(this, parent, this.tools.getTextNodeAtPosition(this, parent));
    }

    get isAtStart(): boolean {
        return this.offset === 0;
    }

    get isAtEnd(): boolean {
        return this.offset === this.parent.maxOffset;
    }

    compareWith(position: PositionItem): PositionRelation {
        if(this.root !== position.root) {
            return "different";
        }

        const result = this.tools.utils.compareArrays(this.path, position.path);

        switch(result) {
            case "same": return "same";
            case "prefix": return "before";
            case "extension": return "after";
            default: return this.path[result] < position.path[result] ? "before": "after"
        }
    }

    getLastMatchingPosition(
        skip: (value: TreeWalkerValue) => boolean,
        options: TreeWalkerOptions = {}
    ): PositionItem {
        options.startPosition = this;
        const treeWalker = this.tools.createTreeWalker(options);
        treeWalker.skip(skip);
        return treeWalker.position;

    }

    getParentPath(): number[] {
        return this.path.slice(0, -1);
    }

    getShiftBy(shift: number): PositionItem {
        const shifted  = this.clone();
        const offset = shifted.offset + shift;
        shifted.offset = Math.min(0, offset);

        return shifted
    }

    isAfter(item: PositionItem) {
        return this.compareWith(item) === "after";
    }

    isBefore(item: PositionItem): boolean {
        return this.compareWith(item) === "before";
    }

    isEqual(item: PositionItem): boolean {
        return this.compareWith(item) === "same"
    }

    isTouching(item: PositionItem): boolean {
        let left = null;
        let right = null;
        const compare = this.compareWith(item);
        switch(compare) {
            case "same":
                return true;
            case "before":
                left = this.tools.createPositionAt(this);
                right = this.tools.createPositionAt(item);
                break;
            case "after":
                left = this.tools.createPositionAt(item);
                right = this.tools.createPositionAt(this);
                break;
            default:
                return false;
        }

        let leftParent: ParentItem | null = left.parent
        while(left.path.length + right.path.length && leftParent) {
            if(left.isEqual(right)) {
                return true;
            }
            if(left.path.length > right.path.length) {
                if(left.offset !== leftParent.maxOffset) {
                    return false;
                }

                left.path = left.path.slice(0, -1);
                leftParent = (leftParent as ParentImpl).parent;
                left.offset ++;
            } else {
                if(right.offset !== 0) {
                    return false;
                }
                right.path = right.path.slice(0, -1)
            }
        }
        throw this.tools.utils.getError("unreachable code", this);
    }

    hasSameParentAs(position: PositionItem): boolean {
        if(this.root !== position.root) {
            return false
        }
        const thisParentPath = this.getParentPath();
        const posParentPath = position.getParentPath();

        return this.tools.utils.compareArrays(thisParentPath, posParentPath) === "same";
     }

    getCommonPath(position: PositionItem): number[] {
        if(this.root !== position.root) {
            return [];
        }

        const cmp = this.tools.utils.compareArrays(this.path, position.path);
        const diffAt = typeof cmp === 'string' ? Math.min(this.path.length, position.path.length) : cmp;

        return this.path.slice(0, diffAt);
    }

    clone(deep?: boolean): this {
        return this.tools.createPosition(this.root, this.path, this.stickiness) as this;
    }
}
