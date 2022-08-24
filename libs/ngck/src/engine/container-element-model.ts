import {ElementModel} from "./element-model";
import {ContainerElement} from "./interfaces";

export class ContainerElementModel extends ElementModel implements ContainerElement {
    override getFillerOffset = () => {
        const children = [...this.getChildren()]
        const lastChild = children[this.childCount - 1]
        if(lastChild && lastChild.is('element', 'br')) {
            return this.childCount
        }
        for(const child of children) {
            if(!child.is('uiElement')) {
                return null
            }
        }
        return this.childCount
    }

    override is(type: string, name?: string): boolean {
        if(!name) {
            return ['containerElement', 'view:containerElement', 'element', 'view:element', 'node', 'view:node'].includes(type)
        }
        return name === this.name && ['containerElement', 'view:containerElement', 'element', 'view:element'].includes(type)
    }
}
