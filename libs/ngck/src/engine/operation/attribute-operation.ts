import {Operation} from "./operation";
import {AttributeOperationImpl, OperationItem, RangeItem} from "../api/node";
import {Tools} from "../api/tools"
import {isEqual} from "lodash-es";

export class AttributeOperation extends Operation implements AttributeOperationImpl {
    constructor(
        private tools: Tools,
        public range: RangeItem,
        public key: string,
        public oldValue: unknown,
        public newValue: unknown,
        baseVersion: number
    ) {
        super(baseVersion);
        this.oldValue = oldValue ?? null;
        this.newValue = newValue ?? null;
    }

    get type(): 'addAttribute' | 'removeAttribute' | 'changeAttribute' {
        if(this.oldValue === null) {
            return "addAttribute";
        } else if (this.newValue === null) {
            return "removeAttribute";
        }
        return "changeAttribute";
    }

    getReversed(): OperationItem {
        return this.tools.createAttributeOperation(this.range, this.key, this.newValue, this.oldValue, this.version + 1);
    }

    override validate() {
        if(!this.range.isFlat) {
            throw this.tools.utils.getError("attribute-operation-range-not-flat", this);
        }

        for(const item of this.range.getItems()) {
            if(this.oldValue !== null && "getAttribute" in item && !isEqual(item.getAttribute(this.key), this.oldValue)) {
                throw this.tools.utils.getError("attribute-operation-wrong-old-value", this, {item, key: this.key, value: this.oldValue});
            }

            if(this.oldValue === null && this.newValue !== null && "hasAttribute" in item && item.hasAttribute(this.key)) {
                throw this.tools.utils.getError("attribute-operation-attribute-exists", this, {node: item, key: this.key});
            }
        }
    }

    override execute() {
        if(!isEqual(this.oldValue, this.newValue)) {
            this.tools.setAttribute(this.range, this.key, this.newValue);
        }
    }
}
