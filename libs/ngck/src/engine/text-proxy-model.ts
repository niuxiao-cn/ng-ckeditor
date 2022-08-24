import {TextProxy, Text, DocTools, Element, DocumentFragment, Node, Document} from "./interfaces";

export class TextProxyModel implements TextProxy {
    readonly data: string
    constructor(public docTools: DocTools, public readonly textNode: Text, public readonly offsetInText: number, length: number) {
        if(offsetInText < 0 || offsetInText > textNode.data.length) {
            throw this.docTools.utils.getError('view-textproxy-wrong-offsetintext', this)
        }

        if(length < 0 || offsetInText + length > textNode.data.length) {
            throw this.docTools.utils.getError('view-textproxy-wrong-length', this)
        }

        this.data = textNode.data.substring(offsetInText, offsetInText + length)
    }

    get offsetSize(): number {
        return this.data.length
    }

    get isPartial(): boolean {
        return this.data.length !== this.textNode.data.length
    }

    get parent(): Element | DocumentFragment | null {
        return this.textNode.parent
    }

    get root(): Node | DocumentFragment {
        return this.textNode.root
    }

    get document(): Document | null {
        return this.textNode.document
    }

    getAncestors(options: {includeSelf?: boolean, parentFirst?: boolean} = {}): (Text | Element | DocumentFragment)[] {
        const ancestors: ( Text | Element | DocumentFragment )[] = [];
        let parent: Text | Element | DocumentFragment | null = options.includeSelf ? this.textNode : this.parent;
        while ( parent !== null ) {
            ancestors[ options.parentFirst ? 'push' : 'unshift' ]( parent );
            parent = parent.parent;
        }

        return ancestors;
    }

    is(type: string): boolean {
        return ['$textProxy', 'view:$textProxy', 'textProxy', 'view:textProxy'].includes(type)
    }
}
