import {Injectable} from "@angular/core";
import {Tools} from "./api/tools";
import {
    BatchType,
    AddOperationImpl,
    ParentImpl,
    IndexImpl,
    ChildrenImpl,
    NodeAttributes,
    RootImpl,
    ChildrenOffsetImpl,
    OperationManageImpl,
    VersionImpl,
    ResetImpl,
    UndoOperationImpl,
    PositionItem,
    TextItem,
    ElementItem,
    DocumentFragmentItem,
    ChildItem,
    ParentItem,
    CloneImpl,
    PositionStickiness,
    NodeImpl,
    TreeWalkerValueType,
    TreeWalkerValue,
    TreeWalkerOptions,
    TreeWalkerImpl,
    TextProxyItem,
    RangeItem,
    PositionTextNodeImpl,
    PositionParentImpl,
    PositionPathImpl,
    AttributeImpl,
    TextImpl,
    OperationItem, AttributeOperationImpl
} from "./api/node";
import {Batch} from "./batch";
import {Utils} from "../utils";
import {Text} from "./text"
import {RootElement} from "./root-element";
import {DocumentFragment} from "./document-fragment";
import {Element} from "./element";
import {History} from "./history";
import {Position} from "./position";
import {TreeWalker} from "./tree-walker";
import {TextProxy} from "./text-proxy";
import {Range} from "./range";
import {AttributeOperation} from "./operation/attribute-operation";

@Injectable()
export class ToolsService implements Tools {
    constructor(public utils: Utils) {
    }
    createAddOperation(type?: BatchType): AddOperationImpl {
        return new Batch(type)
    }

    isAddOperation(node: unknown): node is AddOperationImpl {
        return node instanceof Batch
    }

    createText(data?: string, attrs?: NodeAttributes): TextItem{
        return new Text(this, data, attrs);
    }

    isText(node: unknown): node is TextItem {
        return node instanceof Text
    }

    isTextProxy(node: unknown): node is TextProxyItem {
        return node instanceof TextProxy;
    }

    createTextProxy(textNode: TextItem, offsetIndex: number, length: number): TextProxyItem {
        return new TextProxy(this, textNode, offsetIndex, length);
    }

    createRootElement(name: string, rootName?: string): ElementItem & RootImpl {
        return new RootElement(this, name, rootName);
    }

    createDocumentFragment(): DocumentFragmentItem {
        return new DocumentFragment(this);
    }

    createElement(name: string, attrs?: NodeAttributes, children?: string | ChildItem | Iterable<string | ChildItem>): ElementItem {
        return new Element(this, name, attrs, children);
    }

    isElement(node: unknown): node is ElementItem {
        return node instanceof Element;
    }

    createHistory(): OperationManageImpl & UndoOperationImpl & VersionImpl & ResetImpl {
        return new History(this);
    }

    createTreeWalker(options?: TreeWalkerOptions): TreeWalkerImpl {
        return new TreeWalker(this, options);
    }

    createPosition(root: ParentItem, path: number[], stickiness?: PositionStickiness): PositionItem & CloneImpl {
        return new Position(this, root, path, stickiness);
    }

    createRange(start: PositionItem, end?: PositionItem): RangeItem {
        return new Range(this, start, end);
    }

    createPositionAt(
        item: PositionItem | (ChildrenImpl & NodeImpl & ParentImpl & IndexImpl),
        offset?: number | "before" | "after" | "end",
        stickiness?: PositionStickiness
    ): PositionItem & CloneImpl {
        if(item.type.has("position")) {
            const position = item as PositionItem;
            return this.createPosition(position.root, position.path, position.stickiness);
        }
        const node = item as ChildrenImpl & NodeImpl & ParentImpl & IndexImpl;

        if(offset === "end") {
            offset = node.maxOffset;
        } else if(offset === "before") {
            return this.createPositionBefore(node, stickiness);
        } else if(offset === "after") {
            return this.createPositionAfter(node, stickiness);
        }

        const path = node.getPath();
        path.push(offset as number);
        return this.createPosition(node.root, path, stickiness);
    }

    createPositionAfter(
        item: ChildrenImpl & NodeImpl & ParentImpl & IndexImpl,
        stickiness?: PositionStickiness
    ): PositionItem & CloneImpl {
        if(!item.parent) {
            throw this.utils.getError("model-position-after-root", [item], {root: item});
        }
        return this.createPositionAt(item.parent as (ChildrenImpl & NodeImpl & ParentImpl & IndexImpl), item.endOffset ?? 0, stickiness);
    }

    createPositionBefore(
        item: ChildrenImpl & NodeImpl & ParentImpl & IndexImpl,
        stickiness?: PositionStickiness
    ): PositionItem & CloneImpl {
        if(!item.parent) {
            throw this.utils.getError("model-position-before-root", item, {root: item});
        }
        return this.createPositionAt(item.parent as (ChildrenImpl & NodeImpl & ParentImpl & IndexImpl), item.startOffset ?? 0, stickiness);
    }

    createAttributeOperation(
        range: RangeItem,
        key: string,
        oldValue: unknown,
        newValue: unknown,
        version: number
    ): OperationItem & AttributeOperationImpl {
        return new AttributeOperation(this, range, key, oldValue, newValue, version);
    }

    getNodePath(item: ParentImpl & IndexImpl): number[] {
        const path = []
        let node: ParentImpl & IndexImpl = item
        while(node.parent && item.startOffset !== null) {
            path.unshift(item.startOffset)
            node = (node.parent as ParentImpl & IndexImpl)
        }
        return path
    }

    getNodePos<T>(parent: T | null, fn: (parent: T) => (number | null)): number | null {
        if(!parent) {
            return null
        }
        const pos = fn(parent)
        if(pos === null) {
            throw this.utils.getError("model-node-not-found-in-parent", this);
        }
        return pos
    }

    nodeNextSibling(item: ParentImpl & IndexImpl): ChildItem | null {
        const index = item.index;
        return index !== null && item.parent ? item.parent.getChild(index + 1) : null
    }

    nodePreviousSibling(item: ParentImpl & IndexImpl): ChildItem | null {
        const index = item.index;
        return index !== null && item.parent ? item.parent.getChild(index - 1) : null
    }

    normalize(items: string | ChildItem | Iterable<ChildItem | string>): Iterable<ChildItem> {
       if(typeof items === 'string') {
           return [this.createText(items)]
       }
       if(!this.utils.isIterable(items)) {
           items = [items]
       }
       return Array.from(items).map(item => {
           if(typeof item === "string") {
               return this.createText(item)
           }
           if(this.isTextProxy(item)) {
               return this.createText(item.data);
           }
           return item
       })
    }

    insertChild(target: ParentItem, index: number, item: ChildItem | string | Iterable<ChildItem | string>) {
        const nodes = this.normalize(item);
        for(const node of nodes) {
            if(node.parent && node.index) {
                node.parent.removeChildren(node.index);
            }
            if("parent" in target) {
                node.parent = target;
            }
        }
        (target.getChildren() as ChildItem[]).splice(index, 0, ...nodes);
    }

    removeChildren(target: ChildrenImpl, index: number, howMany = 1): ChildItem[] {
        const nodes = (target.getChildren() as ChildItem[]).splice(index, howMany)
        for(const node of nodes) {
            node.parent = null
        }
        return nodes
    }

    getOffset(list: IndexImpl[]): number {
        return list.reduce((sum, node) => sum + node.offsetSize, 0);
    }

    offsetToIndex(target: ChildrenImpl & ChildrenOffsetImpl, offset: number): number {
        let totalOffset = 0;
        for(const node of target.getChildren()) {
            if(offset >= totalOffset && offset < totalOffset + node.offsetSize) {
                return target.getChildIndex(node) ?? -1;
            }
            totalOffset += node.offsetSize;
        }
        if(totalOffset !== offset) {
            throw this.utils.getError("model-nodelist-offset-out-of-bounds", this, {offset, nodeList: target.getChildren()});
        }

        return (target.getChildren() as unknown[]).length;
    }

    getTextNodeAtPosition(
        position: PositionItem,
        positionParent: ParentItem
    ): TextItem | null {
        const node = positionParent.getChild(positionParent.offsetToIndex(position.offset))
        if(node && node.type.has("$text") && node.startOffset && node.startOffset < position.offset) {
            return node as TextItem
        }
        return null;
    }

    getNodeAfterPosition(position: PositionItem, positionParent: ElementItem | DocumentFragmentItem, textNode: TextItem | null): ChildItem | null {
        if(textNode !== null) {
            return null;
        }
        return positionParent.getChild(positionParent.offsetToIndex(position.offset));
    }

    getNodeBeforePosition(position: PositionItem, positionParent: ParentItem, textNode: TextItem | null): ChildItem | null {
        if(textNode !== null) {
            return null
        }
        return positionParent.getChild(positionParent.offsetToIndex(position.offset ) - 1);
    }

    formatTreeWalkerReturnValue(
        type: TreeWalkerValueType,
        item: ChildItem,
        previousPosition: PositionItem,
        nextPosition: PositionItem,
        length?: number
    ): IteratorResult<TreeWalkerValue> {
        return {
            done: false,
            value: {type, item, previousPosition, nextPosition, length}
        }
    }

    setAttribute(range: RangeItem, key: string, value: unknown) {
        this.splitNodeAtPosition(range.start);
        this.splitNodeAtPosition(range.end);

        for(const item of range.getItems({shallow: true})) {
            if(item.type.has("$text") || item.type.has("$textProxy")) {
                return ;
            }

            if(value !== null) {
                (item as AttributeImpl).setAttribute(key, value)
            } else {
                (item as AttributeImpl).removeAttribute(key);
            }

            if(item.parent && item.index) {
                this.mergeNodesAtIndex((item.parent as AttributeImpl & ChildrenImpl & NodeImpl), item.index)
            }
        }

        this.mergeNodesAtIndex(range.end.parent as AttributeImpl & ChildrenImpl & NodeImpl, range.end.index);
    }

    normalizeNodes(nodes: string | ChildItem | Iterable<string | ChildItem>): ChildItem[] {
        const items = this.convertNodes(nodes);
        for(let i = 1; i < items.length; i++) {
            const node = items[i];
            const prev = items[i - 1];

            if(this.isText(node) && this.isText(prev)) {
                items.splice(i - 1, 2, this.createText(prev.data + node.data));
                i --;
            }
        }
        return items
    }

    private splitNodeAtPosition(position: PositionTextNodeImpl & PositionParentImpl & PositionPathImpl): void {
        const textNode = position.textNode;
        const element = position.parent;

        if(textNode) {
            const offsetDiff = position.offset - (textNode.startOffset ?? 0);
            const index = textNode.index ?? 0;

            element.removeChildren(index, 1);

            const firstPart = this.createText(textNode.data.substring(0, offsetDiff));
            const secondPart = this.createText(textNode.data.substring(offsetDiff));

            element.insertChild(index, [firstPart, secondPart]);
        }
    }

    private mergeNodesAtIndex(element: AttributeImpl & ChildrenImpl & NodeImpl, index: number) {
        const nodeBefore = element.getChild(index - 1);
        const nodeAfter = element.getChild(index);

        if(nodeBefore && nodeAfter && nodeBefore.type.has("$text") && nodeAfter.type.has("$text")) {
            const mergedNode = this.createText((nodeBefore as TextImpl).data);
            element.removeChildren(index - 1, 2);
            element.insertChild(index - 1, mergedNode);
        }
    }

    private convertNodes(nodes: string | ChildItem | Iterable<string | ChildItem>): ChildItem[] {
        if(typeof nodes === 'string') {
            return [this.createText(nodes)];
        }
        if(this.isTextProxy(nodes)) {
            return [this.createText(nodes.data)];
        }
        if(this.utils.isIterable(nodes)) {
            return [...nodes].reduce<ChildItem[]>((result, item) => result.concat(this.convertNodes(item)), []);
        }
        return [nodes]
    }
}
