import {ChangeType, DocumentFragment, Element, Node, Document, DocTools} from "./interfaces";
import {clone} from "lodash-es";

export abstract class NodeModel implements Node {
    parent: Element | DocumentFragment | null = null

    protected constructor(public docTools: DocTools, public document: Document) {}

    get index(): number | null {
        if(!this.parent) {
            return null
        }
        const pos = this.parent.getChildIndex(this)
        if(pos === -1) {
            throw this.docTools.utils.getError("view-node-not-found-in-parent", this)
        }

        return null
    }

    get nextSibling(): Node| null {
        const index = this.index
        return index !== null ? this.parent?.getChild(index + 1) ?? null : null
    }

    get previousSibling(): Node | null {
        const index = this.index
        return index !== null ? this.parent?.getChild(index - 1) ?? null : null
    }

    get root(): Element | DocumentFragment {
        let root: Node | DocumentFragment = this._getSelf()
        while (root.parent) {
            root = root.parent
        }
        return root as Element | DocumentFragment
    }

    isAttached(): boolean {
        return this.root.is('rootElement')
    }

    getPath(): number[] {
        const path: number[] = []
        let node: Node | DocumentFragment = this._getSelf();
        while (node.parent && node.index !== null) {
            path.unshift(node.index)
            node = node.parent
        }
        return path
    }

    getAncestors(options: { includeSelf?: boolean; parentFirst?: boolean } = {}): ( Node | DocumentFragment )[] {
        const ancestors: ( Node | DocumentFragment )[] = [];
        let parent = options.includeSelf ? this : this.parent;

        while ( parent ) {
            ancestors[ options.parentFirst ? 'push' : 'unshift' ]( parent );
            parent = parent.parent;
        }

        return ancestors;
    }

    getCommonAncestor( node: Node, options: { includeSelf?: boolean } = {} ): Element | DocumentFragment | null {
        const ancestorsA = this.getAncestors( options );
        const ancestorsB = node.getAncestors( options );

        let i = 0;

        while ( ancestorsA[ i ] == ancestorsB[ i ] && ancestorsA[ i ] ) {
            i++;
        }

        return i === 0 ? null : ancestorsA[ i - 1 ] as ( Element | DocumentFragment );
    }

    isBefore( node: Node ): boolean {
        if ( this == node ) {
            return false;
        }

        if ( this.root !== node.root ) {
            return false;
        }

        const thisPath = this.getPath();
        const nodePath = node.getPath();

        const result = this.docTools.utils.compareArrays( thisPath, nodePath );

        switch ( result ) {
            case 'prefix':
                return true;

            case 'extension':
                return false;

            default:
                return thisPath[ result as number ] < nodePath[ result as number ];
        }
    }

    isAfter( node: Node ): boolean {
        if ( this == node ) {
            return false;
        }

        if ( this.root !== node.root ) {
            return false;
        }

        return !this.isBefore( node );
    }

    _remove(): void {
        if(this.parent !== null && this.index !== null) {
            this.parent._removeChildren(this.index)
        }
    }

    _fireChange( type: ChangeType, node: Node ): void {
        if(this.parent){
            this.parent._fireChange(type, node)
        }
    }

    toJSON(): unknown {
        const json: unknown = clone( this );

        delete (json as Record<string, unknown>)['parent'];

        return json;
    }

    private _getSelf(): Node {
        return this
    }

    abstract _clone( deep?: boolean ): Node
    abstract isSimilar( other: Node ): boolean

    is(type: string): boolean {
        return type === 'node' || type === 'view:node'
    }
}
