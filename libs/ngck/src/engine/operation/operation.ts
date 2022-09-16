import {AddOperationImpl, BatchImpl, JSONImpl, OperationItem} from "../api/node";

export abstract class Operation implements OperationItem, JSONImpl {
    batch: (BatchImpl & AddOperationImpl) | null = null;
    isDocumentOperation: boolean;
    abstract type: string;

    protected constructor(public version: number) {
        this.isDocumentOperation = version !== -1
    }

    abstract getReversed(): OperationItem
    abstract execute(): void
    abstract validate(): void

    toJSON(): unknown {
        const json = Object.assign({}, this) as Record<string, unknown>;
        json["__className"] = this.constructor.name;

        delete json["batch"];
        delete json["isDocumentOperation"];

        return json;
    }

}
