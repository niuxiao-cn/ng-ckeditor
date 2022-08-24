import {Styles, StylesMap, StylesProcessor, StyleValue} from "./styles";
import {RxState} from "@rx-angular/state";
import {Utils} from "../utils";

export type BatchType = {
    isUndoable?: boolean
    isLocal?: boolean
    isUndo?: boolean
    isTyping?: boolean
}

export interface Batch {
    readonly isUndoable: boolean
    readonly isLocal: boolean
    readonly isUndo: boolean
    readonly isTyping: boolean
    readonly operations: Operation[]

    get baseVersion(): number | null

    addOperation(operation: Operation): Operation
}

export interface Operation {
    baseVersion: number | null
    batch: Batch | null

    readonly isDocumentOperation: boolean
    readonly type: string
}

export interface TypeCheckable {
    docTools: DocTools
    is(type: 'node' | 'view:node'): this is (
        Node
        | Text
        | Element
        | AttributeElement
        | ContainerElement
        | EditableElement
        | EmptyElement
        | RawElement
        | RootEditableElement
        | UIElement
    )

    is(type: 'element' | 'view:element'): this is (
        Element
        | AttributeElement
        | ContainerElement
        | EditableElement
        | EmptyElement
        | RawElement
        | RootEditableElement
        | UIElement
    )
    is(type: 'attributeElement' | 'view:attributeElement'): this is AttributeElement
    is(type: 'containerElement' | 'view:containerElement'): this is ContainerElement | EditableElement | RootEditableElement
    is(type: 'editableElement' | 'view:editableElement'): this is EditableElement | RootEditableElement
    is(type: 'emptyElement' | 'view:emptyElement'): this is EmptyElement
    is(type: 'rawElement' | 'view:rawElement'): this is RawElement
    is(type: 'rootElement' | 'view:rootElement'): this is RootEditableElement
    is(type: 'uiElement' | 'view:uiElement'): this is UIElement
    is(type: '$text' | 'view:$text'): this is Text
    is(type: 'documentFragment' | 'view:documentFragment'): this is DocumentFragment
    is(type: '$textProxy' | 'view:$textProxy'): this is TextProxy
    is(type: 'position' | 'view:position'): this is Position
    is(type: 'range' | 'view:range'): this is Range
    is(type: 'selection' | 'view:selection'): this is Selection | DocumentSelection
    is(type: 'documentSelection' | 'view:documentSelection'): this is DocumentSelection
    is<N extends string>(type: 'element' | 'view:element', name: N): this is (
        Element
        | AttributeElement
        | ContainerElement
        | EditableElement
        | EmptyElement
        | RawElement
        | RootEditableElement
        | UIElement
    ) & {name: N}
    is<N extends string>(type: 'attributeElement' | 'view:attributeElement', name: N): this is AttributeElement & {name: N}
    is<N extends string>(type: 'containerElement' | 'view:containerElement', name: N): this is (
        ContainerElement
        | EditableElement
        | RootEditableElement
    ) & {name: N}
    is<N extends string>(type: 'editableElement' | 'view:editableElement', name: N): this is (
        EditableElement
        | RootEditableElement
    ) & {name: N}
    is<N extends string>(type: 'emptyElement' | 'view:emptyElement', name: N): this is EmptyElement & {name: N}
    is<N extends string>(type: 'rawElement' | 'view:rawElement', name: N): this is RawElement & {name: N}
    is<N extends string>(type: 'rootElement' | 'view:rootElement', name: N): this is RootEditableElement & {name: N}
    is<N extends string>(type: 'uiElement' | 'view:uiElement', name: N): this is UIElement & {name: N}
}

export type Node = TypeCheckable & {
    document: Document
    parent: Element | DocumentFragment | null
    get index(): number | null
    get nextSibling(): Node | null
    get previousSibling(): Node | null
    get root(): Element | DocumentFragment
    isAttached(): boolean
    getPath(): number[]
    getAncestors(options?: {includeSelf?: boolean; parentFirst?: boolean}): (Node | DocumentFragment)[]
    getCommonAncestor(node: Node, options?: { includeSelf?: boolean }): Element | DocumentFragment | null
    isBefore(node: Node): boolean
    isAfter(node: Node): boolean
    _remove(): void
    _fireChange(type: ChangeType, node: Node): void
    toJSON(): unknown
    _clone(deep?: boolean): Node
    isSimilar(other: Node): boolean
}

export type Text = Node & {
    get data(): string
    _data: string
    is(type: string): boolean
    isSimilar(otherNode: Node): boolean
    _clone(): Text
}

export type Element = Node & {
    name: string
    getFillerOffset?: () => number | null
    get childCount(): number
    get isEmpty(): boolean
    get attrsCount(): number
    get stylesCount(): number
    get classesCount(): number
    set classes(classes: Set<string>)
    set customProperties(customProperties: Map<string | symbol, unknown>)
    set unsafeAttributesToRender(unsafeAttributesToRender: string[])
    getChild(index: number): Node | undefined
    getChildIndex(node: Node): number
    getChildren(): IterableIterator<Node>
    getAttributeKeys(): IterableIterator<string>
    getAttributes(): IterableIterator<[string, string]>
    getAttribute(key: string): string | undefined
    hasAttribute(key: string): boolean
    isSimilar(otherElement: Element): boolean
    hasClass(...className: string[]): boolean
    getClassNames(): Iterable<string>
    getStyle(property: string): string | undefined
    getNormalizedStyle(property: string): StyleValue
    getStyleNames(expand?: boolean): Iterable<string>
    hasStyle(...property: string[]): boolean
    findAncestor(...patterns: (MatcherPattern | ((element: Element) => boolean))[]): Element | null
    getCustomProperty(key: string | symbol): unknown
    getCustomProperties(): Iterable<[string | symbol, unknown]>
    getIdentity(): string
    shouldRenderUnsafeAttribute(attributeName: string): boolean
    _clone(deep?: boolean): Element
    _appendChild(items: NodeItem | Iterable<NodeItem>): number
    _insertChild(index: number, items: NodeItem | Iterable<NodeItem>): number
    _removeChildren(index: number, howMany?: number): Node[]
    _setAttribute(key: string, value: string): void
    _removeAttribute(key: string): boolean
    _addClass(className: string | string[]): void
    _removeClass(className: string | string[]): void
    _setStyle(property: string, value: string): void
    _setStyle(property: Record<string, string>): void
    _removeStyle(property: string | string[]): void
    _setCustomProperty( key: string | symbol, value: unknown ): void
    _removeCustomProperty(key: string | symbol): boolean
}

export type AttributeElement = Element & {
    getFillerOffset: () => number | null
    get priority(): number
    set priority(priority: number)
    get id(): string | number | null
    set id(id: string | number | null)
    getElementsWithSameId(): Set<AttributeElement>
    isSimilar( otherElement: Element ): boolean
    _clone( deep?: boolean ): Element
}

export type ContainerElement = Element & {
    readonly getFillerOffset: () => number | null
}

export type EditableElement =  Element & {
    state: RxState<{ isFocused: boolean }>
    destroy(): void
}

export type EmptyElement = Element & {
    readonly getFillerOffset: () => null
}

export type RawElement = Element & {
    readonly getFillerOffset: () => null
}

export type RootEditableElement = EditableElement & {
    rootName: string
}

export type UIElement = Element & {
    readonly getFillerOffset: () => null
    toDomElement(domDocument: DomDocument): DomElement
}

export interface DocumentFragment extends TypeCheckable  {
    get childCount(): number
    get isEmpty(): number
    get root(): this
    get parent(): null
    _appendChild(items: NodeItem | Iterable<NodeItem>): number
    getChild(index: number): Node
    getChildIndex(node: Node): number
    getChildren(): IterableIterator<Node>
    _insertChild(index: number, items: NodeItem | Iterable<NodeItem>): number
    _removeChildren(index: number, howMany?: number): Node[]
    _fireChange(type: ChangeType, node: Node | DocumentFragment): void
    is(type: string): boolean
}

export type TextProxy = TypeCheckable & {
    readonly textNode: Text
    readonly data: string
    readonly offsetInText: number
    get offsetSize(): number
    get isPartial(): boolean
    get parent(): Element | DocumentFragment | null
    get root(): Node | DocumentFragment
    get document(): Document | null
    getAncestors(options?: {includeSelf?: boolean, parentFirst?: boolean}): ( Text | Element | DocumentFragment )[]
    is(type: string): boolean
}

export type Position = TypeCheckable & {
    parent: Node | DocumentFragment
    offset: number
    get nodeAfter(): Node | null
}

export type Range = TypeCheckable & {
    start: Position
    end: Position
    get isCollapsed(): boolean
    get isFlat(): boolean
    get root(): Node | DocumentFragment
}

export type Selection = TypeCheckable & {
    get isFake(): boolean
    get fakeSelectionLabel(): string
}

export type DomElement = globalThis.HTMLElement
export type DomDocument = globalThis.Document
export type ChangeType = 'children' | 'attributes' | 'text'
export interface Match {
    name?: boolean;
    attributes?: string[];
    classes?: string[];
    styles?: string[];
}
export interface MatchResult {
    element: Element;
    pattern: Exclude<MatcherPattern, string | RegExp>;
    match: Match;
}
export type PropertyPatterns =
    true |
    string |
    RegExp |
    Record<string, true | string | RegExp> |
    ( string | RegExp | { key: string | RegExp; value: string | RegExp } )[];

export type ClassPatterns =
    true |
    string |
    RegExp |
    Record<string, true> |
    ( string | RegExp )[];
export type MatcherPattern =
    string |
    RegExp |
    ( ( element: Element ) => Match | null ) |
    {
        name?: string | RegExp;
        classes?: ClassPatterns;
        styles?: PropertyPatterns;
        attributes?: PropertyPatterns;
    };
export type NodeItem = Node | TextProxy;
export type ElementAttributes = Record<string, string> | Iterable<[ string, string ]> | null;

export type Matcher = {
    add(...pattern: MatcherPattern[]): void
    match(...element: Element[]): MatchResult | null
    matchAll(...element: Element[]):MatchResult[] | null
    getElementName(): string | null

}

export interface History {

}

export interface Document {
    readonly stylesProcessor: StylesProcessor

    isReadOnly: boolean
    isFocused: boolean
    isSelecting: boolean
    isComposing: boolean
}

export interface DocumentSelection {
    get isFake(): boolean
    get fakeSelectionLabel(): boolean
}

export abstract class StyleTools {
    abstract getStylesProcessor(): StylesProcessor
    abstract getStylesMap(processor: StylesProcessor): StylesMap
    abstract appendStyleValue(stylesObject: Styles, nameOrPath: string, valueOrObject: StyleValue): void
    abstract toPath(name: string): string
    abstract parseInlineStyles(stylesString: string): Map<string, string>
}

export type CreateElementParams =
[Document, string, ElementAttributes | undefined, Node | Iterable<Node> | undefined]

export abstract class DocTools {
    static ATTRIBUTE_ELEMENT_DEFAULT_PRIORITY = 10
    abstract style: StyleTools
    abstract utils: Utils
    abstract match: MatchTools
    abstract getText(document: Document, data: string): Text
    abstract getTextProxy(textNode: Text, offsetInText: number, length: number): TextProxy
    abstract getMatcher(...patterns: MatcherPattern[]): Matcher
    abstract getElement(...args: CreateElementParams): Element
    abstract getAttributeElement(...args: CreateElementParams): AttributeElement
    abstract getContainerElement(...args: CreateElementParams): ContainerElement
    abstract getEditableElement(...args: CreateElementParams): EditableElement
    abstract getEmptyElement(...args: CreateElementParams): EmptyElement
    abstract getRawElement(...args: CreateElementParams): RawElement
    abstract parseAttributes(attrs?: ElementAttributes): Map<string, string>
    abstract normalize(document: Document, nodes: string | NodeItem | Iterable<string | NodeItem>): Node[]
    abstract parseClasses(classesSet: Set<string>, classesString: string): void
    abstract isNode<T>(node: T): node is T
    abstract isText<T>(node: T): node is T
    abstract isTextProxy<T>(node: T): node is T
    abstract isElement<T>(node: T): node is T
    abstract isAttributeElement<T>(node: T): node is T
    abstract isContainerElement<T>(node: T): node is T
    abstract isEditableElement<T>(node: T): node is T
    abstract isEmptyElement<T>(node: T): node is T
    abstract isRawElement<T>(node: T): node is T
}

export abstract class MatchTools {
    abstract isElementMatching(element: Element, pattern: Exclude<MatcherPattern, string | RegExp>): Match | null
    abstract matchName(pattern: string | RegExp, name: string): boolean
    abstract matchPatterns(patterns: PropertyPatterns, keys: Iterable<string>, valueGetter?: (value: string) => unknown): string[] | undefined
    abstract normalizePatterns(patterns: PropertyPatterns): [true | string | RegExp, true | string | RegExp][]
    abstract isKeyMatched(patternKey: true | string | RegExp, itemKey: string): boolean
    abstract isValueMatched(patternValue: true | string | RegExp, itemKey: string, valueGetter?: (value: string) => unknown): boolean
    abstract matchAttributes(patterns: PropertyPatterns, element: Element): string[] | undefined
    abstract matchClasses(patterns: ClassPatterns, element: Element): string[] | undefined
    abstract matchStyles(patterns: PropertyPatterns, element: Element): string[] | undefined
}

