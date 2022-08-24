import {Element, Document, ElementAttributes, NodeItem, Node, DocTools, MatcherPattern} from "./interfaces";
import {NodeModel} from "./node-model";
import {StyleValue} from "./styles";
import {isPlainObject} from "lodash-es";

export class ElementModel extends NodeModel implements Element {
    public getFillerOffset?: () => number | null;

    private _unsafeAttributesToRender: string[] = []
    private readonly _attrs: Map<string, string>
    private readonly _children: Node[] = []
    private readonly _classes: Set<string> = new Set()
    private readonly _styles = this.docTools.style.getStylesMap(this.document.stylesProcessor)
    private readonly _customProperties: Map<string | symbol, unknown> = new Map()

    constructor(
        docTools: DocTools,
        document: Document,
        public name: string,
        attrs?: ElementAttributes,
        children?: Node | Iterable<Node>
    ) {
        super(docTools, document);
        this._attrs = this.docTools.parseAttributes(attrs)

        if(children) {
            this._insertChild(0, children)
        }

        if(this._attrs.has('class')) {
            const classString = this._attrs.get('class') ?? ''
            this.docTools.parseClasses(this._classes, classString)
            this._attrs.delete('class')
        }

        if(this._attrs.has('style')) {
            this._styles.setTo(this._attrs.get('style') ?? '')
            this._attrs.delete('style')
        }
    }

    get childCount(): number {
        return this._children.length
    }

    get isEmpty(): boolean {
        return this._children.length === 0
    }

    get attrsCount():number {
        return this._attrs.size
    }

    get stylesCount(): number {
        return this._styles.size
    }

    get classesCount(): number {
        return this._classes.size
    }

    set classes(classes: Set<string>) {
        this._classes.clear()
        classes.forEach(item => this._classes.add(item))
    }

    set customProperties(customProperties: Map<string | symbol, unknown>) {
        this._customProperties.clear()
        customProperties.forEach((value, key) => {
            this._customProperties.set(key, value)
        })
    }

    set unsafeAttributesToRender(unsafeAttributesToRender: string[]) {
        this._unsafeAttributesToRender = unsafeAttributesToRender
    }

    getChild(index: number): Node | undefined {
        return this._children[index]
    }

    getChildIndex(node: Node):number {
        return this._children.indexOf(node)
    }

    getChildren(): IterableIterator<Node> {
        return this._children[Symbol.iterator]()
    }

    * getAttributeKeys(): IterableIterator<string> {
        if(this._classes.size > 0) {
            yield 'class'
        }
        if(!this._styles.isEmpty) {
            yield 'styles'
        }
        yield* this._attrs.keys()
    }

    * getAttributes(): IterableIterator<[string, string]> {
        yield* this._attrs.entries()
        if(this._classes.size > 0) {
            yield ['class', this.getAttribute('class') ?? '']
        }
        if(!this._styles.isEmpty) {
            yield ['style', this.getAttribute('style') ?? '']
        }
    }

    getAttribute(key: string): string | undefined {
        if(key === 'class') {
            if(this._classes.size > 0) {
                return [...this._classes].join(' ')
            }
            return undefined
        }
        if(key === 'styles') {
            const inlineStyle = this._styles.toStr()
            return inlineStyle || undefined
        }
        return this._attrs.get(key)
    }

    hasAttribute(key: string): boolean {
        if(key === 'class') {
            return this._classes.size > 0
        }
        if(key === 'style') {
            return !this._styles.isEmpty
        }
        return this._attrs.has(key)
    }

    isSimilar(otherElement: Element): boolean {
        if(!this.docTools.isElement(otherElement)) {
            return false
        }
        if(this === otherElement) {
            return true
        }
        if(this.name !== otherElement.name) {
            return false
        }

        if(this.attrsCount !== otherElement.attrsCount || this.stylesCount !== otherElement.stylesCount || this.classesCount !== otherElement.classesCount) {
            return false
        }
        for(const [key, value] of this._attrs) {
            if(!otherElement.hasAttribute(key) || otherElement.getAttribute(key) !== value) {
                return false
            }
        }

        for(const className of this._classes) {
            if(!otherElement.hasClass(className)) {
                return false
            }
        }

        for(const property of this._styles.getStyleNames(this._styles.get().styles)) {
            if(!otherElement.hasStyle(property) || this.getStyle(property) !== otherElement.getStyle(property)) {
                return false
            }
        }

        return true
    }

    hasClass(...className: string[]): boolean {
        return className.every(name => this._classes.has(name))
    }

    getClassNames(): Iterable<string> {
        return this._classes.keys()
    }

    getStyle(property: string): string | undefined {
        return this._styles.getAsString(property)
    }

    getNormalizedStyle(property: string): StyleValue {
        return this._styles.getNormalized(property)
    }

    getStyleNames(expand?: boolean): Iterable<string> {
        return this._styles.getStyleNames(this._styles.get().styles, expand)
    }

    hasStyle(...property: string[]): boolean {
        return property.every(name => this._styles.has(name))
    }

    findAncestor(...patterns: ( MatcherPattern | ( ( element: Element ) => boolean ) )[] ): Element | null {
        const matcher = this.docTools.getMatcher(...patterns as MatcherPattern[])
        let parent = this.parent;
        while(parent && !parent.is('documentFragment')) {
            if(matcher.match(parent as Element)) {
                return parent
            }
            parent = parent.parent
        }
        return null
    }

    getCustomProperty(key: string | symbol): unknown {
        return this._customProperties.get(key)
    }

    * getCustomProperties(): Iterable<[string | symbol, unknown]> {
        yield* this._customProperties.entries()
    }

    getIdentity(): string {
        const classes = Array.from(this._classes).sort().join(',')
        const styles = this._styles.toStr()
        const attributes = Array.from(this._attrs).map(i => `${i[0]}="${i[1]}"`).sort().join(' ')
        return this.name +
            (classes === "" ? "" : `class="${classes}"`) +
            (!styles ? '' : `style="${styles}"`) +
            (attributes === "" ? "" : `${attributes}`)
    }

    shouldRenderUnsafeAttribute(attributeName: string): boolean {
        return this._unsafeAttributesToRender.includes(attributeName)
    }

    _clone(deep = false): Element {
        const childrenClone = []
        if(deep) {
            for(const child of this.getChildren()) {
                childrenClone.push(child._clone(deep))
            }
        }
        const cloned = this.docTools.getElement(this.document, this.name, this._attrs, this._children)
        cloned.classes = this._classes
        cloned._setStyle(this._styles.getNormalized() as Record<string, string>)
        cloned.customProperties = this._customProperties
        cloned.getFillerOffset = this.getFillerOffset
        cloned.unsafeAttributesToRender = this._unsafeAttributesToRender

        return cloned
    }

    _appendChild(items: NodeItem | Iterable<NodeItem>): number {
        return this._insertChild(this.childCount, items)
    }

    _insertChild(index: number, items: NodeItem | Iterable<NodeItem>): number {
        this._fireChange('children', this);
        let count = 0;
        const nodes = this.docTools.normalize(this.document, items)

        for(const node of nodes) {
            if(node.parent !== null) {
                node._remove()
            }
            node.parent = this
            node.document = this.document

            this._children.splice(index, 0, node)
            index ++
            count ++
        }
        return count
    }

    _removeChildren(index: number, howMany: number = 1): Node[] {
        this._fireChange("children", this)

        for(let i = index; i < index + howMany; i++) {
            this._children[i].parent = null
        }

        return this._children.splice(index, howMany)
    }

    _setAttribute(key: string, value: string): void {
        value = String(value)
        this._fireChange('attributes', this)

        if(key === 'class') {
            this.docTools.parseClasses(this._classes, value)
        } else if(key === 'style') {
            this._styles.setTo(value)
        } else {
            this._attrs.set(key, value)
        }
    }

    _removeAttribute(key: string): boolean {
        this._fireChange("attributes", this)

        if(key === "class") {
            if(this._classes.size > 0) {
                this._classes.clear()
                return true
            }
            return false
        }

        if(key === "style") {
            if(!this._styles.isEmpty) {
                this._styles.clear()
                return true
            }
            return false
        }

        return this._attrs.delete(key)
    }

    _addClass(className: string | string[]) {
        this._fireChange("attributes", this)
        for(const name of this.docTools.utils.toArray(className)) {
            this._classes.add(name)
        }
    }

    _removeClass(className: string | string[]) {
        this._fireChange('attributes', this)
        for(const name of this.docTools.utils.toArray(className)) {
            this._classes.delete(name)
        }
    }

    _setStyle(property: string | Record<string, string>, value?: string) {
        this._fireChange('attributes', this)
        if(isPlainObject(property)) {
            this._styles.setStyle(property as Record<string, string>)
        } else {
            this._styles.setStyle(property as string, value as string)
        }
    }

    _removeStyle(property: string | string[]) {
        this._fireChange('attributes', this)
        for(const name of this.docTools.utils.toArray(property)) {
            this._styles.remove(name)
        }
    }

    _setCustomProperty( key: string | symbol, value: unknown ): void {
        this._customProperties.set(key, value)
    }

    _removeCustomProperty(key: string | symbol): boolean {
        return this._customProperties.delete(key)
    }

    override is(type:string, name?: string): boolean {
        if(!name) {
            return ['element', 'view:element', 'node', 'view:node'].includes(type)
        }
        return name === this.name && (type === "element" || type === "view:element")
    }

}
