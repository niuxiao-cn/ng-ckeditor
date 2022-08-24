import {Injectable} from "@angular/core";
import {
    AttributeElement, ContainerElement, CreateElementParams,
    DocTools,
    Document, EditableElement, Element,
    ElementAttributes, EmptyElement, Matcher, MatcherPattern,
    MatchTools,
    Node,
    NodeItem, RawElement,
    StyleTools,
    Text,
    TextProxy
} from "./interfaces";
import {Utils} from "../utils";
import {TextModel} from "./text-model";
import {ElementModel} from "./element-model";
import {TextProxyModel} from "./text-proxy-model";
import {MatcherModel} from "./matcher-model";
import {AttributeElementModel} from "./attribute-element-model";
import {ContainerElementModel} from "./container-element-model";
import {EditableElementModel} from "./editable-element-model";
import {EmptyElementModel} from "./empty-element-model";
import {NodeModel} from "./node-model";
import {RawElementModel} from "./raw-element-model";

@Injectable()
export class DocToolsService implements DocTools {
    constructor(public style: StyleTools, public utils: Utils, public match: MatchTools) {}

    getText(document: Document, data: string): Text {
        return new TextModel(this, document, data);
    }

    getTextProxy(textNode: Text, offsetInText: number, length: number): TextProxy {
        return new TextProxyModel(this, textNode, offsetInText, length)
    }

    getMatcher(...patterns: MatcherPattern[]): Matcher {
        return new MatcherModel(this, ...patterns);
    }

    getElement(...args: CreateElementParams): Element {
        return new ElementModel(this, ...args)
    }

    getAttributeElement(...args: CreateElementParams): AttributeElement {
        return new AttributeElementModel(this, ...args);
    }

    getContainerElement(...args: CreateElementParams): ContainerElement {
        return new ContainerElementModel(this, ...args)
    }

    getEditableElement(...args: CreateElementParams): EditableElement {
        return new EditableElementModel(this, ...args);
    }

    getEmptyElement(...args: CreateElementParams): EmptyElement {
        return new EmptyElementModel(this, ...args);
    }

    getRawElement(...args: CreateElementParams): RawElement {
        return new RawElementModel(this, ...args)
    }

    isNode<T>(node: T): node is T {
        return node instanceof NodeModel;
    }

    isText<T>(node: T): node is T {
        return node instanceof TextModel
    }

    isElement<T>(node: T): node is T {
        return node instanceof ElementModel;
    }

    isTextProxy<T>(node: T): node is T {
        return node instanceof TextProxyModel
    }

    isAttributeElement<T>(node: T): node is T {
        return node instanceof AttributeElementModel
    }

    isContainerElement<T>(node: T): node is T {
        return node instanceof ContainerElementModel
    }

    isEditableElement<T>(node: T): node is T {
        return node instanceof EditableElementModel;
    }

    isEmptyElement<T>(node: T): node is T {
        return node instanceof EmptyElementModel
    }

    isRawElement<T>(node: T): node is T {
        return node instanceof RawElementModel;
    }

    parseAttributes(attrs?: ElementAttributes) {
        const attrsMap = this.utils.toMap(attrs)
        for(const [key, value] of attrsMap) {
            if(value === null) {
                attrsMap.delete(key)
            }
        }
        return attrsMap
    }

    normalize(document: Document, nodes: string | NodeItem | Iterable<string | NodeItem>): Node[] {
        if(typeof nodes === 'string') {
            return [this.getText(document, nodes)]
        }

        if(!this.utils.isIterable(nodes)) {
            nodes = [nodes]
        }

        return Array.from(nodes).map(node => {
            if(typeof node === 'string') {
                return this.getText(document, node)
            }
            if(this.isTextProxy(node)) {
                return this.getText(document, (node as TextProxy).data)
            }
            return node as Node
        })
    }

    parseClasses(classesSet: Set<string>, classesString: string) {
        const classArray = classesString.split(/\s+/)
        classesSet.clear()
        classArray.forEach(name => classesSet.add(name))
    }
}

