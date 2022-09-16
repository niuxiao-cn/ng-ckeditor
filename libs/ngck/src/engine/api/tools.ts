import {
    AddOperationImpl,
    BatchType,
    ChildItem,
    ChildrenImpl,
    ChildrenOffsetImpl,
    DocumentFragmentItem,
    ElementItem,
    IndexImpl,
    NodeAttributes,
    TextItem,
    NodeItem,
    OperationManageImpl,
    ParentImpl,
    PositionItem,
    ResetImpl,
    RootImpl,
    UndoOperationImpl,
    VersionImpl,
    ParentItem,
    TreeWalkerOptions,
    TreeWalkerImpl,
    PositionStickiness,
    CloneImpl,
    NodeImpl, TreeWalkerValue, TreeWalkerValueType, TextProxyItem, RangeItem, OperationItem, AttributeOperationImpl,
} from "./node";
import {Utils} from "../../utils";

export abstract class Tools {
    abstract utils: Utils

    abstract createAddOperation(type?: BatchType): AddOperationImpl

    abstract isAddOperation(node: unknown): node is AddOperationImpl

    abstract createText(data?: string, attrs?: NodeAttributes): TextItem

    abstract createTextProxy(textNode: TextItem, offsetIndex: number, length: number): TextProxyItem

    abstract isText(node: unknown): node is TextItem

    abstract isTextProxy(node: unknown): node is TextProxyItem

    abstract createRootElement(name: string, rootName?: string): ElementItem & RootImpl

    abstract createDocumentFragment(): DocumentFragmentItem

    abstract createElement(name: string, attrs?: NodeAttributes, children?: string | NodeItem | Iterable<string | NodeItem>): ElementItem

    abstract isElement(node: unknown): node is ElementItem

    abstract createHistory(): OperationManageImpl & UndoOperationImpl & VersionImpl & ResetImpl

    abstract createTreeWalker(options?: TreeWalkerOptions): TreeWalkerImpl

    abstract createPosition(root: ParentItem, path: number[], stickiness?: PositionStickiness): PositionItem & CloneImpl;

    abstract createRange(start: PositionItem, end?: PositionItem): RangeItem

    abstract createAttributeOperation(range: RangeItem, key: string, oldValue: unknown, newValue: unknown, version: number): AttributeOperationImpl & OperationItem

    abstract createPositionAt(
        item: PositionItem | (ChildrenImpl & NodeImpl & ParentImpl & IndexImpl),
        offset?: number | "before" | "after" | "end",
        stickiness?: PositionStickiness
    ): PositionItem & CloneImpl

    abstract createPositionAfter(
        item: (ChildrenImpl & NodeImpl & ParentImpl & IndexImpl),
        stickiness?: PositionStickiness
    ): PositionItem & CloneImpl

    abstract createPositionBefore(
        item: (ChildrenImpl & NodeImpl & ParentImpl & IndexImpl),
        stickiness?: PositionStickiness
    ): PositionItem & CloneImpl

    abstract getNodePos<T>(parent: T | null, fn: (parent: T) => number | null): number | null

    abstract getNodePath(item: ParentImpl & IndexImpl): number[]

    abstract nodeNextSibling(item: ParentImpl & IndexImpl): ChildItem | null

    abstract nodePreviousSibling(item: ParentImpl & IndexImpl): ChildItem | null

    abstract normalize(items: string | ChildItem | Iterable<ChildItem | string>): Iterable<ChildItem>

    abstract insertChild(target: ElementItem | DocumentFragmentItem, index: number, item: ChildItem | string | Iterable<ChildItem | string>): void

    abstract removeChildren(target: ChildrenImpl, index: number, howMany?: number): ChildItem[]

    abstract getOffset(list: IndexImpl[]): number

    abstract offsetToIndex(target: ChildrenImpl & ChildrenOffsetImpl, offset: number): number

    abstract getTextNodeAtPosition(
        position: PositionItem,
        positionParent: ParentItem
    ): TextItem | null

    abstract getNodeAfterPosition(
        position: PositionItem,
        positionParent: ParentItem,
        textNode: TextItem | null
    ): ChildItem | null

    abstract getNodeBeforePosition(
        position: PositionItem,
        positionParent: ParentItem,
        textNode: TextItem | null
    ): ChildItem | null

    abstract formatTreeWalkerReturnValue(
        type: TreeWalkerValueType,
        item: ChildItem,
        previousPosition: PositionItem,
        nextPosition: PositionItem,
        length?: number
    ): IteratorResult<TreeWalkerValue>

    abstract setAttribute(range: RangeItem, key: string, value: unknown): void

    abstract normalizeNodes(nodes: string | ChildItem | Iterable<string | ChildItem>) : ChildItem[]
}

