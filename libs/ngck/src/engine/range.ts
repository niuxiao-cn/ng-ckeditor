import {
    ChildItem,
    ChildrenImpl,
    CloneImpl,
    IndexImpl,
    NodeImpl, ParentImpl,
    ParentItem,
    PositionItem,
    RangeItem, TreeWalkerImpl, TreeWalkerOptions,
    TreeWalkerValue
} from "./api/node";
import {Tools} from "./api/tools";

export class Range implements RangeItem {
    name = "";
    type = new Set(["range", "model:range"]);

    readonly start: PositionItem & CloneImpl;
    readonly end: PositionItem & CloneImpl;
    constructor(private tools: Tools, start: PositionItem, end?: PositionItem | null) {
        this.start = this.tools.createPositionAt(start);
        this.end = end ? this.tools.createPositionAt(end) : this.tools.createPositionAt(start);

        this.start.stickiness = this.isCollapsed ? "toNone" : "toNext";
        this.end.stickiness = this.isCollapsed ? "toNone" : "toPrevious";
    }

    get isCollapsed(): boolean {
        return this.start.isEqual(this.end);
    }

    get isFlat(): boolean {
        const startParentPath = this.start.getParentPath();
        const endParentPath = this.end.getParentPath();

        return this.tools.utils.compareArrays(startParentPath, endParentPath) === "same";
    }

    get root(): ParentItem {
        return this.start.root;
    }

    * [ Symbol.iterator ](): IterableIterator<TreeWalkerValue> {
        yield* this.tools.createTreeWalker({boundaries: this, ignoreElementEnd: true});
    }

    containsPosition(position: PositionItem): boolean {
        return position.isAfter(this.start) && position.isBefore(this.end);
    }

    containsRange(range: RangeItem, loose = false): boolean {
        if(range.isCollapsed) {
            loose = false;
        }

        const containsStart = this.containsPosition(range.start) || (loose && this.start.isEqual(range.start));
        const containsEnd = this.containsPosition(range.end) || (loose && this.end.isEqual(range.end));

        return containsStart && containsEnd;
    }

    containsItem(item: ChildrenImpl & NodeImpl & ParentImpl & IndexImpl): boolean {
        const pos = this.tools.createPositionBefore(item);
        return this.containsPosition(pos) || this.start.isEqual(pos);
    }

    isEqual(range: RangeItem): boolean {
        return  this.start.isEqual(range.start) && this.end.isEqual(range.end);
    }

    isIntersecting(range: RangeItem): boolean {
        return this.start.isBefore(range.end) && this.end.isAfter(range.start);
    }

    getDifference(range: RangeItem): RangeItem[] {
        const ranges: RangeItem[] = [];
        if(this.isIntersecting(range)) {
            if(this.containsPosition(range.start)) {
                ranges.push(this.tools.createRange(this.start, range.start));
            }

            if(this.containsPosition(range.end)) {
                ranges.push(this.tools.createRange(range.end, this.end));
            }
        } else {
            ranges.push(this.tools.createRange(this.start, this.end));
        }

        return ranges
    }

    getIntersection(range: RangeItem): RangeItem | null {
        if(!this.isIntersecting(range)) {
            return null;
        }

        const commonRangeStart = this.containsPosition(range.start) ? range.start : this.start;
        const commonRangeEnd = this.containsPosition(range.end) ? range.end : this.end;

        return this.tools.createRange(commonRangeStart, commonRangeEnd);
    }

    getJoined(range: RangeItem, loose = false ): RangeItem | null {
        const shouldJoin = this.isIntersecting(range) || (
            this.start.isBefore(range.start) ? (
                loose ? this.end.isTouching(range.start) : this.end.isEqual(range.start)
            ) : (
                loose ? range.end.isTouching(this.start) : range.end.isEqual(this.start)
            )
        );

        if(!shouldJoin) {
            return null;
        }

        const startPosition = range.start.isBefore(this.start) ? range.start : this.start;
        const endPosition = range.end.isAfter(this.end) ? range.end : this.end;

        return this.tools.createRange(startPosition, endPosition);
    }

    getMinimalFlatRanges(): RangeItem[] {
        const ranges: RangeItem[] = [];
        const diffAt = this.start.getCommonPath(this.end).length;

        const pos = this.tools.createPositionAt(this.start);
        let posParent: ParentItem | null = pos.parent;

        while (pos.path.length  > diffAt + 1 && posParent) {
            const howMany = posParent.maxOffset - pos.offset;
            if(howMany !== 0) {
                ranges.push(this.tools.createRange(pos, pos.getShiftBy(howMany)));
            }

            pos.path = pos.path.slice(0, -1);
            pos.offset ++;
            posParent = (posParent as ParentImpl).parent;
        }

        while(pos.path.length <= this.end.path.length) {
            const offset = this.end.path[pos.path.length - 1];
            const howMany = offset - pos.offset;

            if(howMany !== 0) {
                ranges.push(this.tools.createRange(pos, pos.getShiftBy(howMany)));
            }

            pos.offset = offset;
            pos.path.push(0);
        }

        return ranges;
    }

    getWalker(options: TreeWalkerOptions = {}): TreeWalkerImpl {
        options.boundaries = this;
        return this.tools.createTreeWalker(options);
    }

    * getItems(options: TreeWalkerOptions = {}): IterableIterator<ChildItem> {
        options.boundaries = this;
        options.ignoreElementEnd = true;

        const treeWalker = this.tools.createTreeWalker(options);

        for(const value of treeWalker) {
            yield value.item
        }
    }

    * getPositions(options: TreeWalkerOptions = {}): IterableIterator<PositionItem> {
        options.boundaries = this;
        const treeWalker = this.tools.createTreeWalker(options);
        yield treeWalker.position;
        for(const value of treeWalker) {
            yield value.nextPosition;
        }
    }
}
