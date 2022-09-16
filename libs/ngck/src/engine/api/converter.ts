import {RootElementImpl} from "./model";
import {NodeItem, ChildrenImpl, NodeImpl, ChildrenOffsetImpl, RootImpl, TextImpl, TextItem} from "./node";

export type DomNode = globalThis.Node;
export type DomElement = globalThis.Element;
export type DomDocumentFragment = globalThis.DocumentFragment
export type DomText = globalThis.Text;

export interface DomValidator {
    isElement(node: DomNode): node is DomElement
    isDocumentFragment(node: DomNode): node is DomDocumentFragment
    isBlockFilter(node: DomNode): boolean
    isBlockElement(node: DomNode): boolean
}

export interface ParseImpl {
    toModel(dom: DomNode, root: RootElementImpl):
        NodeItem | (NodeItem & ChildrenImpl & ChildrenOffsetImpl) | (ChildrenImpl & NodeImpl & ChildrenOffsetImpl) | TextItem | null
    getHostElement(node: DomNode, root: RootElementImpl):
        NodeItem | (NodeItem & ChildrenImpl) | (ChildrenImpl & NodeImpl) | null
    mapDomToModel(root: RootElementImpl, domElementOrDocumentFragment: DomElement | DomDocumentFragment):
        NodeItem | (NodeItem & ChildrenImpl) | (ChildrenImpl & NodeImpl) | undefined
    domChildren(root: RootElementImpl, domElement: DomElement):
        IterableIterator<(NodeItem & ChildrenImpl & ChildrenOffsetImpl) | NodeItem>
}

export interface Filters {
    readonly PRE_ELEMENTS: Set<string>
    readonly BLOCK_ELEMENTS: Set<string>
    readonly INLINE_OBJECT_ELEMENTS: Set<string>
    BR_FILTER(): HTMLBRElement
    isInlineFilter(domText: DomText): boolean
    isText(node: unknown): node is DomText
    getDataWithoutFiller(domText: DomText): string
    startsWithFiller(domNode: DomNode): boolean
}
