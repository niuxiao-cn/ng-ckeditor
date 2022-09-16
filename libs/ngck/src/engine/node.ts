import {AttributeImpl, JSONImpl, NodeAttributes, NodeImpl, ChildrenImpl, ParentImpl, IndexImpl} from "./api/node";
import {Utils} from "../utils"

export class Node implements NodeImpl, AttributeImpl, JSONImpl {
    private _attrs: Map<string, unknown>;

    name = ""
    type = new Set(["node", "model:node"]);

    constructor(protected utils: Utils, attrs?: NodeAttributes) {
        this._attrs = this.utils.toMap(attrs)
    }

    clearAttributes(): void {
        this._attrs.clear()
    }

    getAttribute(key: string): unknown {
        return this._attrs.get(key);
    }

    getAttributeKeys(): IterableIterator<string> {
        return this._attrs.keys();
    }

    getAttributes(): IterableIterator<[string, unknown]> {
        return this._attrs.entries();
    }

    hasAttribute(key: string): boolean {
        return this._attrs.has(key);
    }

    removeAttribute(key: string): boolean {
        return this._attrs.delete(key);
    }

    setAttribute(name: string, value: unknown) {
        this._attrs.set(name, value);
    }

    setAttributesTo(attrs: NodeAttributes): void {
        this._attrs = this.utils.toMap(attrs)
    }

    toJSON(): Record<string, unknown> {
        const json: Record<string, unknown> = {}
        if(this._attrs.size) {
            json['attributes'] = Array.from(this._attrs).reduce<Record<string, unknown>>((result, attr) => {
                result[attr[0]] = attr[1]
                return result
            }, {})
        }
        return json
    }
}
