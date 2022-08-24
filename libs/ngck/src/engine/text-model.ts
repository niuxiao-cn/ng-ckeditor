import {NodeModel} from "./node-model";
import {Text, Document, Node, DocTools} from './interfaces';

export class TextModel extends NodeModel implements Text {
    private _textData: string

    constructor(docTools: DocTools, document: Document, data: string) {
        super(docTools, document);
        this._textData = data
    }

    get data(): string {
        return this._textData
    }

    get _data(): string {
        return this.data
    }

    set _data(value: string) {
        this._fireChange('text', this)
        this._textData = value
    }

    isSimilar(otherNode: Node): boolean {
        if(!this.docTools.isText(otherNode)) {
            return false
        }
        return (this as Node) === otherNode || this.data === (otherNode as Text).data
    }

    _clone(): Text {
        return this.docTools.getText(this.document, this.data)
    }

    override is(type: string): boolean {
        return ['$text', 'view:$text', 'text', 'view:text', 'node', 'view:node'].includes(type);
    }
}
