import {AddOperationImpl, BatchImpl, VersionImpl, BatchType, OperationItem} from "./api/node";

export class Batch implements BatchImpl, VersionImpl, AddOperationImpl {
    readonly isUndoable: boolean;
    readonly isLocal: boolean;
    readonly isUndo: boolean;
    readonly isTyping: boolean;

    operations: OperationItem[] = []

    version = -1

    constructor(type: BatchType = {}) {
        const { isUndoable = true, isLocal = true, isUndo = false, isTyping = false } = type;
        this.isUndoable = isUndoable;
        this.isLocal = isLocal;
        this.isUndo = isUndo;
        this.isTyping = isTyping
    }

    addOperation(operation: OperationItem) {
        operation.batch = this
        if(this.version < 0) {
            this.version = operation.version
        }
        this.operations.push(operation)
    }
}
