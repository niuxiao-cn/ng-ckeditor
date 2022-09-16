import {
    BatchType,
    AddOperationImpl,
    NodeImpl,
    ChildrenImpl,
    RootImpl,
    NodeItem,
    OperationManageImpl,
    UndoOperationImpl, VersionImpl, ResetImpl, ChildrenOffsetImpl
} from "./node";
import {DomElement, DomDocumentFragment, DomNode} from "./converter";
import {Processor} from "./processor";
import {Model} from "@ckeditor/ckeditor5-engine";

export interface ChangeImpl {
    change<TReturn>( callback: ( batch: AddOperationImpl ) => TReturn ): TReturn
    enqueueChange(
        batchOrType: AddOperationImpl | BatchType | undefined,
        callback: (batch: AddOperationImpl) => unknown
    ): void;

    enqueueChange(
        callback: (batch: AddOperationImpl) => unknown
    ): void;
}

export interface RootElementImpl {
    root: NodeImpl & ChildrenImpl & RootImpl
    domMapping: WeakMap<DomElement | DomDocumentFragment, NodeItem | (NodeItem & ChildrenImpl) | (ChildrenImpl & NodeImpl & ChildrenOffsetImpl)>
    encounteredRawContentDomNodes: WeakSet<DomNode>
    engine: Processor
    model: Model
}

export interface HistoryImpl {
    history: OperationManageImpl & UndoOperationImpl & VersionImpl & ResetImpl
}
