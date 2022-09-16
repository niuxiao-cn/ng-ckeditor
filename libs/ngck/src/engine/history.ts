import {OperationItem, OperationManageImpl, ResetImpl, VersionImpl} from "./api/node";
import {Tools} from "./api/tools";

export class History implements OperationManageImpl, VersionImpl, ResetImpl {
    operations: OperationItem[] = [];

    private _undoPairs = new Map<OperationItem, OperationItem>();
    private _baseVersionToOperationIndex = new Map<number, number>();
    private _undoneOperations = new Set<OperationItem>();
    private _gaps = new Map<number, number>();
    private _version = 0;

    constructor(private tools: Tools) { }

    get version(): number {
        return this._version;
    }

    set version(version) {
        if(this.operations.length && version > this._version + 1) {
            this._gaps.set(this._version, version);
        }
        this._version = version;
    }

    get lastOperation(): OperationItem | undefined {
        return this.operations[this.operations.length - 1];
    }

    addOperation(operation: OperationItem) {
        if(operation.version !== this._version) {
            throw this.tools.utils.getError("model-document-history-addoperation-incorrect-version", this, {operation, historyVersion: this._version});
        }
        this.operations.push(operation);
        this._version ++ ;
        this._baseVersionToOperationIndex.set(operation.version, this.operations.length - 1);
    }

    getOperations(fromBaseVersion: number, toBaseVersion = this.version): OperationItem[] {
        if(!this.operations.length || !this.lastOperation) {
            return [];
        }
        const firstOperation = this.operations[0];
        let inclusiveTo = toBaseVersion - 1;
        for(const [gapFrom, gapTo] of this._gaps) {
            if(fromBaseVersion > gapFrom && fromBaseVersion < gapTo) {
                fromBaseVersion = gapTo;
            }
            if(inclusiveTo > gapFrom && inclusiveTo < gapTo) {
                inclusiveTo = gapFrom - 1;
            }
        }

        if(inclusiveTo < firstOperation.version || fromBaseVersion > this.lastOperation.version) {
            return [];
        }

        const fromIndex = this._baseVersionToOperationIndex.get(fromBaseVersion) ?? 0;
        const toIndex = this._baseVersionToOperationIndex.get(inclusiveTo) ?? this.operations.length - 1;

        return this.operations.slice(fromIndex, toIndex + 1);
    }

    getOperation(baseVersion: number): OperationItem | undefined {
        const operationIndex = this._baseVersionToOperationIndex.get(baseVersion);

        if(operationIndex === undefined) {
            return ;
        }
        return this.operations[operationIndex];
    }

    setOperationAsUndone(undoneOperation: OperationItem, undoingOperation: OperationItem) {
        this._undoPairs.set(undoingOperation, undoneOperation);
        this._undoneOperations.add(undoneOperation);
    }

    isUndoingOperation(operation: OperationItem): boolean {
        return this._undoPairs.has(operation);
    }

    isUndoneOperation(operation: OperationItem): boolean {
        return this._undoneOperations.has(operation);
    }

    getUndoneOperation(undoingOperation: OperationItem): OperationItem | undefined {
        return this._undoPairs.get(undoingOperation);
    }

    reset() {
        this._version = 0;
        this._undoPairs = new Map();
        this.operations = [];
        this._undoneOperations = new Set();
        this._gaps = new Map();
        this._baseVersionToOperationIndex = new Map();
    }
}
