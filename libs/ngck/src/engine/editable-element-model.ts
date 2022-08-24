import {RxState} from "@rx-angular/state";
import {ElementModel} from "./element-model";
import {EditableElement} from "./interfaces";

export class EditableElementModel extends ElementModel implements EditableElement {
    state: RxState<{ isFocused: boolean }> = new RxState()

    constructor(...args: ConstructorParameters<typeof ElementModel>) {
        super(...args);
        this.state.set({isFocused: false})
    }

    destroy() {
        this.state.ngOnDestroy()
    }

    override is(type: string, name?: string): boolean {
        if(!name) {
            return ['editableElement', 'view:editableElement', 'containerElement', 'view:containerElement', 'element', 'view:element', 'node', 'view:node'].includes(type)
        }
        return name === this.name && ['editableElement', 'view:editableElement', 'containerElement', 'view:containerElement', 'element', 'view:element'].includes(type)
    }
}
