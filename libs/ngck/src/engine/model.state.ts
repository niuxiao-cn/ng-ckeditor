import {Injectable} from "@angular/core";
import {RxState} from "@rx-angular/state";
import {ChangeImpl, HistoryImpl, RootElementImpl} from "./api/model";
import {Tools} from "./api/tools";
import {BatchType, AddOperationImpl, BatchImpl} from "./api/node";
import produce from "immer";
import {Model} from "@ckeditor/ckeditor5-engine";
import {Engine} from "./engine";

@Injectable()
export class ModelState
    extends RxState<{pendingChanges: {batch: AddOperationImpl; callback: (batch: AddOperationImpl) => unknown}[]}>
    implements ChangeImpl, RootElementImpl, HistoryImpl {
    root = this.tools.createRootElement("$root")
    domMapping = new WeakMap()
    encounteredRawContentDomNodes = new WeakSet()
    history = this.tools.createHistory()

    model = new Model()

    constructor(private tools: Tools, public engine: Engine) {
        super();
        this.set({pendingChanges: []});
        this.model.document.createRoot();
    }

    change<TReturn>(callback: (batch: AddOperationImpl) => TReturn): TReturn {
        if(this.get().pendingChanges.length === 0) {
            this.set("pendingChanges", state => produce(state.pendingChanges, draft => {
                draft.push({batch: this.tools.createAddOperation(), callback})
            }))
            return this._runPendingChanges()[0] as TReturn
        }
        return callback(this.get().pendingChanges[0].batch)
    }

    enqueueChange(batchOrType: (AddOperationImpl) | BatchType | undefined | ((batch: AddOperationImpl) => unknown), callback?: (batch: AddOperationImpl) => unknown): void {
        let batch: AddOperationImpl = batchOrType as AddOperationImpl
        let _callback: (batch: AddOperationImpl) => unknown = callback as (batch: AddOperationImpl) => unknown
        if(!batchOrType) {
            batch = this.tools.createAddOperation();
        } else if(typeof batchOrType === "function") {
            _callback = batchOrType;
            batch = this.tools.createAddOperation();
        } else if(!this.tools.isAddOperation(batchOrType)) {
            batch = this.tools.createAddOperation(batchOrType);
        }
        this.set("pendingChanges", state => produce(state.pendingChanges, draft => {
            draft.push({batch, callback: _callback})
        }))
        if(this.get().pendingChanges.length === 1) {
            this._runPendingChanges()
        }
    }

    private _runPendingChanges(): unknown[] {
        const ret: unknown[] = []
        try {
            const pendingChanges = this.get().pendingChanges.slice()
            while (pendingChanges.length) {
                const currentBatch = pendingChanges[0].batch
                const result = pendingChanges[0].callback(currentBatch)
                console.log(result)
                ret.push(ret)
                pendingChanges.shift()
            }
        } finally {
            this.set({pendingChanges: []})
        }
        return ret
    }
}
