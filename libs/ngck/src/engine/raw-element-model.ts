import {ElementModel} from "./element-model";
import {NodeItem, RawElement} from "./interfaces";

export class RawElementModel extends ElementModel implements RawElement {
    override readonly getFillerOffset = () => null

    override _insertChild(index: number, items: NodeItem | Iterable<NodeItem>): number {
        if(items && (this.docTools.isNode(items) || Array.from(items as Iterable<NodeItem>).length > 0)) {
            throw this.docTools.utils.getError('view-rawelement-cannot-add', [this, items])
        }
        return 0
    }

    override is(type: string, name?: string): boolean {
        if ( !name ) {
            return type === 'rawElement' || type === 'view:rawElement' ||
                // From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
                type === this.name || type === 'view:' + this.name ||
                type === 'element' || type === 'view:element' ||
                type === 'node' || type === 'view:node';
        } else {
            return name === this.name && (
                type === 'rawElement' || type === 'view:rawElement' ||
                type === 'element' || type === 'view:element'
            );
        }
    }
}
