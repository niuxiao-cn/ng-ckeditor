import {ElementModel} from "./element-model";
import {AttributeElement, DocTools, DocumentFragment, Element} from "./interfaces";

export class AttributeElementModel extends ElementModel implements AttributeElement {
    override getFillerOffset: () => number | null = AttributeElementModel.getFillerOffset.bind(this)

    private  _priority = DocTools.ATTRIBUTE_ELEMENT_DEFAULT_PRIORITY
    private  _id: string | number | null = null
    private  _clonesGroup: Set<AttributeElement> | null = null

    get priority(): number {
        return this._priority
    }

    set priority(priority) {
        this._priority = priority
    }

    get id(): string | number | null {
        return this._id
    }

    set id(id: string | number | null) {
        this._id = id
    }

    static getFillerOffset(this: AttributeElement): number | null {
        if(AttributeElementModel.nonUiChildrenCount(this)) {
            return null
        }
        let element = this.parent
        while (element && element.is('attributeElement')) {
            if(AttributeElementModel.nonUiChildrenCount(element) > 1) {
                return null
            }
            element = element.parent
        }
        if(!element || AttributeElementModel.nonUiChildrenCount(element) > 1) {
            return null
        }
        return this.childCount
    }

    static nonUiChildrenCount( element: Element | DocumentFragment ): number {
        return Array.from(element.getChildren()).filter(element => !element.is("uiElement")).length
    }

    getElementsWithSameId(): Set<AttributeElement> {
        if(this.id === null) {
            throw this.docTools.utils.getError("attribute-element-get-elements-with-same-id-no-id", this)
        }

        return new Set(this._clonesGroup)
    }

    override isSimilar(otherElement: Element & {id: string | number | null, priority: number}): boolean {
        if(this.id !== null || otherElement.id !== null) {
            return this.id === otherElement.id
        }
        return super.isSimilar(otherElement) && this.priority === otherElement.priority
    }

    override _clone(deep: boolean = false): Element {
        const cloned = super._clone(deep);
        (cloned as AttributeElement).priority = this._priority;
        (cloned as AttributeElement).id = this.id;
        return cloned
    }

    override is(type: string, name?: string): boolean {
        if(!name) {
            return ['attributeElement', 'view:attributeElement', 'element', 'view:element', 'node', 'view:node'].includes(type)
        }
        return name === this.name && ['attributeElement', 'view:attributeElement', 'element', 'view:element'].includes(type)
    }
}
