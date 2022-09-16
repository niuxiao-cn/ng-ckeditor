export type NodeAttributes = Record<string, unknown> | Iterable<[ string, unknown ]>

export type BatchType = {
    isUndoable?: boolean;

    isLocal?: boolean;

    isUndo?: boolean;

    isTyping?: boolean;
}

export type NodeItem = NodeImpl & AttributeImpl & IndexImpl & ParentImpl;
export type TextItem = TextImpl & ParentImpl & IndexImpl & NodeImpl;
export type ElementItem = NodeItem & ChildrenImpl & ChildrenOffsetImpl;
export type DocumentFragmentItem = NodeImpl & ChildrenImpl & ChildrenOffsetImpl;
export type TextProxyItem = NodeImpl & IndexImpl & ParentImpl & TextProxyImpl & TextImpl;

export type ChildItem =  NodeItem | TextItem | ElementItem | TextProxyItem;
export type ParentItem = ElementItem | DocumentFragmentItem

export type OperationItem = OperationImpl & VersionImpl & ValidateImpl & {batch: (BatchImpl & AddOperationImpl) | null};

export type PositionStickiness = "toNone" | "toNext" | "toPrevious";

export interface PositionItem extends
    NodeImpl,
    PositionPathImpl,
    PositionParentImpl,
    PositionMatchingImpl,
    PositionTextNodeImpl,
    Omit<TransformByOperationImpl<PositionItem & CloneImpl>, "getTransformedByOperations"> {}
export type PositionMatchItem = PositionPathImpl & PositionParentImpl & PositionMatchingImpl

export type RangeItem = NodeImpl & RangeBaseImpl & RangeCompareImpl

export type PositionRelation = 'before' | 'after' | 'same' | 'different';

export interface NodeImpl {
    name: string
    readonly type: Set<string>
}

export interface JSONImpl {
    toJSON(): unknown
}

export interface AttributeImpl {
    hasAttribute(key: string): boolean
    getAttribute(key: string): unknown
    getAttributes(): IterableIterator<[string, unknown]>
    getAttributeKeys(): IterableIterator<string>
    setAttributesTo(attrs: NodeAttributes): void
    setAttribute(name: string, value: unknown): void
    removeAttribute(key: string): boolean
    clearAttributes(): void
}

export interface RootImpl {
    rootName: string
}

export interface ParentImpl {
    parent: ParentItem | null
    get root(): ParentItem
    getPath(): number[]
    nextSibling(): ChildItem | null
    previousSibling(): ChildItem | null
}

export interface IndexImpl {
    get index(): number | null
    get startOffset(): number | null
    get offsetSize(): number
    get endOffset(): number | null
}

export interface ChildrenImpl {
    get childCount(): number
    get maxOffset(): number
    get isEmpty(): boolean
    getChild(index: number): ChildItem | null
    getChildren(): Iterable<ChildItem>
    getChildIndex(item: ChildItem): number | null
    insertChild(index: number, item:  ChildItem | string | Iterable<ChildItem | string>): void
    removeChildren(index: number, howMany?: number): ChildItem[]
    clearChildren(): void
    appendChild(item: ChildItem | string | Iterable<ChildItem | string>): void
}

export interface ChildrenOffsetImpl {
    getChildStartOffset(item: ChildItem): number | null
    indexToOffset(index: number): number
    offsetToIndex(offset: number): number
}

export interface TextImpl {
    data: string
}

export interface VersionImpl {
    version: number
}

export interface ValidateImpl {
    validate(): void
    execute(): void
}

export interface CloneImpl {
    clone(deep?: boolean): this
}

export interface BatchImpl {
    isUndoable: boolean
    isLocal: boolean
    isUndo: boolean
    isTyping: boolean
}

export interface OperationImpl {
    type: string
    isDocumentOperation: boolean
    getReversed(): OperationItem
}

export interface AddOperationImpl {
    operations: OperationItem[]
    addOperation(operation: OperationItem): void
}

export interface UndoOperationImpl {
    isUndoingOperation(operation: OperationItem): boolean
    isUndoneOperation(operation: OperationItem): boolean
    getUndoneOperation(undoingOperation: OperationItem): OperationItem | undefined
    setOperationAsUndone(undoneOperation: OperationItem, undoingOperation: OperationItem): void
}

export interface OperationManageImpl extends AddOperationImpl, UndoOperationImpl{
    get lastOperation(): OperationItem | undefined
    getOperations(fromBaseVersion: number, toBaseVersion?: number): OperationItem[]
    getOperation(baseVersion: number): OperationItem | undefined
}

export interface ResetImpl {
    reset(): void
}

export interface PositionPathImpl {
    path: number[]
    stickiness: PositionStickiness
    offset: number
}

export interface PositionParentImpl {
    readonly root: ParentItem
    get parent(): this["root"]
    get index(): number
    get nodeAfter(): ChildItem | null
    get nodeBefore(): ChildItem | null
    get isAtStart(): boolean
    get isAtEnd(): boolean
    getParentPath(): number[]
    getCommonPath(position: PositionItem): number[]
}

export interface PositionTextNodeImpl {
    get textNode(): TextItem | null
}

export interface PositionMatchingImpl {
    compareWith(position: PositionMatchItem): PositionRelation
    getLastMatchingPosition(
        skip: (value: TreeWalkerValue) => boolean,
        options?: TreeWalkerOptions
    ): PositionItem
    getShiftBy(shift: number): PositionItem
    isAfter(position: PositionMatchItem): boolean
    isBefore(position: PositionMatchItem): boolean
    isEqual(position: PositionMatchItem): boolean
    isTouching(position: PositionMatchItem): boolean
    hasSameParentAs(position: PositionMatchItem): boolean
}

export interface TransformByOperationImpl<T> {
    getTransformedByOperation(operation: OperationItem): T
    getTransformedByOperations(operations: Iterable<OperationItem>): T
}

export interface RangeBaseImpl extends Iterable<TreeWalkerValue> {
    readonly start: PositionItem & CloneImpl
    readonly end: PositionItem & CloneImpl

    get root(): ParentItem
    get isFlat(): boolean
    get isCollapsed(): boolean

    [ Symbol.iterator ](): IterableIterator<TreeWalkerValue>

    getItems(options?: TreeWalkerOptions): IterableIterator<ChildItem>
    getPositions(options?: TreeWalkerOptions): IterableIterator<PositionItem>
    getWalker(options?: TreeWalkerOptions): TreeWalkerImpl
}

export interface RangeCompareImpl {
    containsPosition(position: PositionItem): boolean
    containsRange(range: RangeItem, loose?: boolean): boolean
    containsItem(item: ChildrenImpl & NodeImpl & ParentImpl & IndexImpl): boolean
    isEqual(range: RangeItem): boolean
    isIntersecting(range: RangeItem): boolean
    getDifference(range: RangeItem): RangeItem[]
    getIntersection(range: RangeItem): RangeItem | null
    getJoined(range: RangeItem, loose?: boolean): RangeItem | null
    getMinimalFlatRanges(): RangeItem[]
}

export interface RangeTransformImpl {
    getTransformedByOperation(operation: OperationItem): RangeItem[]
}

export type TreeWalkerValueType = 'elementStart' | 'elementEnd' | 'text';

export type TreeWalkerDirection = "forward" | "backward";

export interface TreeWalkerValue {
    type: TreeWalkerValueType
    item: ChildItem
    previousPosition: PositionItem
    nextPosition: PositionItem
    length?: number
}

export type TreeWalkerOptions = {
    direction?: TreeWalkerDirection
    boundaries?: RangeItem | null
    startPosition?: PositionItem & CloneImpl
    singleCharacters?: boolean
    shallow?: boolean
    ignoreElementEnd?: boolean
}

export interface TreeWalkerImpl extends Iterable<TreeWalkerValue> {
    readonly direction: TreeWalkerDirection
    readonly boundaries: RangeItem | null
    position: PositionItem
    readonly singleCharacters: boolean
    readonly shallow: boolean
    readonly ignoreElementEnd: boolean

    [ Symbol.iterator ](): IterableIterator<TreeWalkerValue>

    skip(skip: (value: TreeWalkerValue) => boolean): void
    next(): IteratorResult<TreeWalkerValue>
}

export interface TextProxyImpl {
    textNode: TextItem
    get isPartial(): boolean
}

export interface AttributeOperationImpl {
    range: RangeItem
    key: string
    oldValue: unknown
    newValue: unknown
}

export interface InsertOperationImpl {
    position: PositionItem
    nodes: ChildItem[]
    shouldReceiveAttribute: boolean

    get howMany(): number
}




