import { Injectable } from "@angular/core";
import {DomDocumentFragment, DomElement, DomNode, DomText, DomValidator, ParseImpl} from "./api/converter";
import {DomFiltersService} from "./dom-filters.service";
import {Tools} from "./api/tools";
import {RootElementImpl} from "./api/model";
import {NodeItem, ChildrenImpl, NodeImpl, AttributeImpl, ChildrenOffsetImpl, TextItem} from "./api/node";

@Injectable()
export class ConverterService implements DomValidator, ParseImpl {
    constructor(private domFilter: DomFiltersService, private tools: Tools) {}

    toModel(
        dom: DomNode, root: RootElementImpl
    ): NodeItem | (NodeItem & ChildrenImpl & ChildrenOffsetImpl) | (ChildrenImpl & NodeImpl & ChildrenOffsetImpl) | TextItem | null {
        if(this.isBlockFilter(dom)) {
            return null;
        }
        const hostElement = this.getHostElement(dom, root);
        if(hostElement) {
            return hostElement;
        }
        if(this.domFilter.isText(dom)) {
            if(this.domFilter.isInlineFilter(dom)) {
                return null;
            } else {
                const textData = this._processDataFromDomText(root, dom);
                return textData === "" ? null : this.tools.createText(textData);
            }
        }
        const element = this.mapDomToModel(root, dom as DomElement | DomDocumentFragment)
        if(element) {
            return element;
        }

        let _element: (NodeImpl & ChildrenImpl & ChildrenOffsetImpl) | NodeItem & ChildrenImpl & ChildrenOffsetImpl;

        if(this.isDocumentFragment(dom)) {
            _element = this.tools.createDocumentFragment();
        } else {
            _element = this.tools.createElement((dom as DomElement).tagName.toLowerCase());
            const attrs = (dom as DomElement).attributes;
            if(attrs) {
                for(let i = 0; i < attrs.length; i ++) {
                    (_element as AttributeImpl).setAttribute(attrs[i].name, attrs[i].value);
                }
            }
        }

        for(const child of this.domChildren(root, dom as DomElement)) {
            (_element as ChildrenImpl).appendChild(child);
        }

        return _element;
    }

    mapDomToModel(root: RootElementImpl, domElementOrDocumentFragment: DomElement | DomDocumentFragment): NodeItem | (NodeItem & ChildrenImpl & ChildrenOffsetImpl) | (ChildrenImpl & NodeImpl & ChildrenOffsetImpl) | undefined {
        return this.getHostElement(domElementOrDocumentFragment, root) ?? root.domMapping.get(domElementOrDocumentFragment);
    }

    * domChildren(root: RootElementImpl, domElement: DomElement): IterableIterator<(NodeItem & ChildrenImpl & ChildrenOffsetImpl) | NodeItem> {
        for(let i = 0; i < domElement.childNodes.length;i ++) {
            const domChild = domElement.childNodes[i];
            const element = this.toModel(domChild, root) as (NodeItem & ChildrenImpl & ChildrenOffsetImpl) | NodeItem;
            if(element !== null) {
                yield element;
            }
        }
    }

    isElement(node: DomNode): node is DomElement {
        return node && node.nodeType === Node.ELEMENT_NODE;
    }

    isDocumentFragment(node: DomNode): node is DomDocumentFragment {
        return node && node.nodeType === Node.DOCUMENT_FRAGMENT_NODE;
    }

    isBlockFilter(node: DomNode): boolean {
        return node.isEqualNode(this.domFilter.BR_FILTER())
    }

    isBlockElement(node: DomNode): boolean {
        return this.isElement(node) && this.domFilter.BLOCK_ELEMENTS.has(node.tagName.toLowerCase())
    }

    getHostElement(node: DomNode, root: RootElementImpl): NodeItem | (NodeItem & ChildrenImpl) | (NodeImpl & ChildrenImpl & ChildrenOffsetImpl) | null {
        const ancestors = this.tools.utils.getAncestors(node)
        ancestors.pop()
        while (ancestors.length) {
            const domNode = ancestors.pop();
            const viewNode = root.domMapping.get(domNode as DomElement);
            if(viewNode && viewNode.type.has("documentFragment")) {
                return viewNode;
            }
        }
        return null;
    }

    private _processDataFromDomText(root: RootElementImpl, node: DomText): string {
        let data = node.data
        if(this._hasDomParentOfType(node, this.domFilter.PRE_ELEMENTS)) {
            return this.domFilter.getDataWithoutFiller(node)
        }
        data = data.replace( /[ \n\t\r]+/g, ' ' );
        const prevNode = this._getTouchingInlineDomNode(node, false);
        const nextNode = this._getTouchingInlineDomNode(node, true);

        const shouldLeftTrim = this._checkShouldLeftTrimDomText(root, node, prevNode );
        const shouldRightTrim = this._checkShouldRightTrimDomText( node, nextNode );

        if(shouldLeftTrim) {
            data = data.replace( /^ /, '' );
        }

        if(shouldRightTrim) {
            data = data.replace( / $/, '' );
        }

        data = this.domFilter.getDataWithoutFiller(new Text(data));
        data = data.replace( / \u00A0/g, '  ' );

        const isNextNodeInlineObjectElement = nextNode && this.isElement( nextNode ) && nextNode.tagName != 'BR';
        const isNextNodeStartingWithSpace = nextNode && this.domFilter.isText( nextNode ) && nextNode.data.charAt( 0 ) == ' ';

        if ( /([ \u00A0])\u00A0$/.test( data ) || !nextNode || isNextNodeInlineObjectElement || isNextNodeStartingWithSpace ) {
            data = data.replace( /\u00A0$/, ' ' );
        }

        if ( shouldLeftTrim || prevNode && this.isElement( prevNode ) && prevNode.tagName != 'BR' ) {
            data = data.replace( /^\u00A0/, ' ' );
        }

        return data;
    }

    private _hasDomParentOfType(node: DomNode, types: Set<string>) {
        const parents = this.tools.utils.getAncestors(node)
        return parents.some(parent => (parent as DomElement).tagName && types.has((parent as DomElement).tagName.toLowerCase()))
    }

    private _getTouchingInlineDomNode( node: DomText, getNext: boolean ): DomNode | null {
        if(!node.parentNode) {
            return null
        }

        const stepInto = getNext ? 'firstChild' : 'lastChild';
        const stepOver = getNext ? 'nextSibling' : 'previousSibling';

        let skipChildren = true;
        let returnNode: DomNode | null = node;

        do {
            if ( !skipChildren && returnNode &&  returnNode[ stepInto ] ) {
                returnNode = returnNode[stepInto];
            } else if (returnNode && returnNode[stepOver]) {
                returnNode=returnNode[stepOver];
                skipChildren = false;
            } else if(returnNode) {
                returnNode = returnNode.parentNode;
                skipChildren = true;
            }

            if(!returnNode || this.isBlockElement(returnNode)) {
                return null
            }
        } while(!this.domFilter.isText(returnNode) || (returnNode as DomNode as DomElement).tagName === "BR" || this._isInlineObjectElement(returnNode))

        return returnNode
    }

    private _isInlineObjectElement(node: DomNode): boolean {
        return this.isElement(node) && this.domFilter.INLINE_OBJECT_ELEMENTS.has(node.tagName.toLowerCase())
    }

    private _checkShouldLeftTrimDomText(root:RootElementImpl, node: DomText, prevNode: DomNode | null): boolean {
        if(!prevNode) {
            return true
        }

        if(this.isElement(prevNode)) {
            return prevNode.tagName === "BR"
        }

        if(root.encounteredRawContentDomNodes.has(node.previousSibling as DomNode)) {
            return false
        }
        return /[^\S\u00A0]/.test( ( prevNode as DomText ).data.charAt( ( prevNode as DomText ).data.length - 1 ) );
    }

    private _checkShouldRightTrimDomText(node: DomText, nextNode: DomNode | null ): boolean {
        if(nextNode) {
            return false;
        }
        return this.domFilter.startsWithFiller(node);
    }
}
