import {Batch, BatchType, Operation} from "./interfaces";

export class BatchModel implements Batch {
    readonly operations: Operation[]
    readonly isLocal: boolean;
    readonly isTyping: boolean;
    readonly isUndo: boolean;
    readonly isUndoable: boolean;

    constructor(type: BatchType | string = {}) {
        if(typeof type === 'string') {
            type = type === 'transparent' ? {isUndoable: false} : {}
        }

        const {isUndoable = true, isLocal = true, isUndo = false ,isTyping = false} = type as BatchType;

        this.operations = []
        this.isUndoable = isUndoable
        this.isLocal = isLocal
        this.isUndo = isUndo
        this.isTyping = isTyping
    }


    addOperation(operation: Operation): Operation {
        operation.batch = this;
        this.operations.push(operation)
        return operation
    }

    get baseVersion(): number | null {
        for(const op of this.operations) {
            if(op.baseVersion !== null) {
                return op.baseVersion
            }
        }
        return null;
    }
}
