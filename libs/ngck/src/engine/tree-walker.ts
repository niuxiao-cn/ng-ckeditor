import {
    CloneImpl,
    ParentItem,
    PositionItem,
    RangeItem,
    TreeWalkerDirection,
    TreeWalkerImpl,
    TreeWalkerOptions, TreeWalkerValue
} from "./api/node";
import {Tools} from "./api/tools";

export class TreeWalker implements TreeWalkerImpl {
    readonly direction: TreeWalkerDirection
    readonly boundaries: RangeItem | null
    readonly singleCharacters: boolean
    readonly shallow: boolean
    readonly ignoreElementEnd: boolean

    position: PositionItem & CloneImpl

    private _boundaryStartParent: ParentItem | null
    private _boundaryEndParent: ParentItem | null
    private _visitedParent: ParentItem

    constructor(private tools: Tools, options: TreeWalkerOptions = {}) {
        // validate Options
        if(!options.boundaries && !options.startPosition) {
            throw this.tools.utils.getError("model-tree-walker-no-start-position", null);
        }
        this.direction = options.direction ?? "forward";
        this.boundaries = options.boundaries || null;

        // setPosition
        if(options.startPosition) {
            this.position = options.startPosition.clone() as PositionItem & CloneImpl;
        } else {
            if(!this.boundaries) {
                throw this.tools.utils.getError("model-tree-walker-no-start-position", null);
            }
            this.position = this.boundaries[this.direction === "backward" ? "end" : "start"];
        }
        this.position.stickiness = "toNone";
        // setOptions
        this.singleCharacters = !!options.singleCharacters;
        this.shallow = !!options.shallow;
        this.ignoreElementEnd = !!options.ignoreElementEnd;

        // setParents
        this._boundaryStartParent = this.boundaries ? this.boundaries.start.parent : null;
        this._boundaryEndParent = this.boundaries ? this.boundaries.end.parent : null;
        this._visitedParent = this.position.parent;
    }

    [ Symbol.iterator ](): IterableIterator<TreeWalkerValue> {
        return this;
    }

    skip( skip: ( value: TreeWalkerValue ) => boolean ): void {
        let done, value, prevPosition, prevVisitedParent;
        do {
            prevPosition = this.position;
            prevVisitedParent = this._visitedParent;
            ({done, value} = this.next());
        } while (!done && skip(value))

        if(!done) {
            this.position = prevPosition;
            this._visitedParent = prevVisitedParent;
        }
    }

    next(): IteratorResult<TreeWalkerValue> {
        if(this.direction == "forward") {
            return this._next();
        }
        return this._previous();
    }

    private _next(): IteratorResult<TreeWalkerValue> {
        const previousPosition = this.position;
        const position = this.position.clone();
        const parent = this._visitedParent;

        if((!('parent' in parent) ||  parent.parent === null) && position.offset === parent.maxOffset) {
            return {done: true, value: undefined};
        }

        if(parent === this._boundaryEndParent && this.boundaries && position.offset === this.boundaries.end.offset) {
            return {done: true, value: undefined};
        }

        const textNodeAtPosition = this.tools.getTextNodeAtPosition(position, parent);
        const node = textNodeAtPosition ?? this.tools.getNodeAfterPosition(position, parent, textNodeAtPosition);

        if(this.tools.isElement(node)) {
            if(!this.shallow) {
                position.path.push(0);
                this._visitedParent = node;
            } else {
                position.offset ++;
            }

            this.position = position
            return this.tools.formatTreeWalkerReturnValue("elementStart", node, previousPosition, position, 1);
        } else if(this.tools.isText(node)) {
            let charactersCount;
            if(this.singleCharacters) {
                charactersCount = 1;
            } else {
                let offset = node.endOffset ?? 0;
                if(this._boundaryEndParent === parent && this.boundaries && this.boundaries.end.offset < offset) {
                    offset = this.boundaries.end.offset;
                }
                charactersCount = offset - position.offset;
            }

            const offsetIndexTextNode = position.offset - (node.startOffset ?? 0);
            const item = this.tools.createTextProxy(node, offsetIndexTextNode, charactersCount);
            position.offset += charactersCount;
            this.position = position;

            return this.tools.formatTreeWalkerReturnValue("text", item, previousPosition, position, charactersCount);
        }

        position.path.pop();
        position.offset ++;
        this.position = position;
        if(!('parent' in parent) || !parent.parent) {
            throw this.tools.utils.getError("parent-is-not-found", this)
        }
        this._visitedParent = parent.parent
        if(this.ignoreElementEnd) {
            return this._next();
        }

        return this.tools.formatTreeWalkerReturnValue("elementEnd", parent, previousPosition, position);
    }

    private _previous(): IteratorResult<TreeWalkerValue> {
        const previousPosition = this.position;
        const position = this.position.clone();
        const parent = this._visitedParent;

        if((!("parent" in parent) || parent.parent === null) && position.offset === 0) {
            return {done: true, value: undefined};
        }

        if(parent === this._boundaryStartParent && this.boundaries && position.offset === this.boundaries.start.offset) {
            return {done: true, value: undefined};
        }

        const positionParent = position.parent;
        const textNodeAtPosition = this.tools.getTextNodeAtPosition(position, positionParent);
        const node = textNodeAtPosition ?? this.tools.getNodeBeforePosition(position, positionParent, textNodeAtPosition);

        if(this.tools.isElement(node)) {
            position.offset -- ;
            if(!this.shallow) {
                position.path.push(node.maxOffset);
                this.position = position;
                this._visitedParent = node;

                if(this.ignoreElementEnd) {
                    return this._previous();
                }
                return this.tools.formatTreeWalkerReturnValue("elementEnd", node, previousPosition, position);
            }
            this.position = position;
            return this.tools.formatTreeWalkerReturnValue("elementStart", node, previousPosition, position, 1);
        } else if(this.tools.isText(node)) {
            let charactersCount;
            if(this.singleCharacters) {
                charactersCount = 1;
            } else {
                let offset = node.startOffset ?? 0;
                if(this._boundaryStartParent === parent && this.boundaries && this.boundaries.start.offset > offset) {
                    offset = this.boundaries.start.offset;
                }
                charactersCount = position.offset - offset
            }
            const offsetInTextNode = position.offset - (node.startOffset ?? 0);
            const item = this.tools.createTextProxy(node, offsetInTextNode - charactersCount, charactersCount);
            position.offset -= charactersCount;
            this.position = position;
            return this.tools.formatTreeWalkerReturnValue("text", item, previousPosition, position, charactersCount);
        }

        position.path.pop();
        this.position = position;
        if(!('parent' in parent) || !parent.parent) {
            throw this.tools.utils.getError("parent-is-not-found", this)
        }
        this._visitedParent = parent.parent;
        return this.tools.formatTreeWalkerReturnValue("elementStart", parent, previousPosition, position, 1);
    }
}
