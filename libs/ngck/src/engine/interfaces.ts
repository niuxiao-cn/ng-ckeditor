export type BatchType = {
    isUndoable?: boolean
    isLocal?: boolean
    isUndo?: boolean
    isTyping?: boolean
}

export interface Batch {
    readonly isUndoable: boolean
    readonly isLocal: boolean
    readonly isUndo: boolean
    readonly isTyping: boolean
    readonly operations: Operation[]

    get baseVersion(): number | null

    addOperation(operation: Operation): Operation
}

export interface Operation {
    baseVersion: number | null
    batch: Batch | null

    readonly isDocumentOperation: boolean
    readonly type: string
}


export abstract class History {

}
