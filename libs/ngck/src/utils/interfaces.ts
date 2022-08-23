export interface CKEditorError extends Error {
    readonly context: object | null | undefined
    readonly data?: object
    name: string

    is(type: string): boolean
}

export abstract class Utils {
    abstract getError(errorName: string, context: object | null | undefined, data?: object): CKEditorError
    abstract throwError(err: Error, context: object): void
    abstract logWarning(errorName: string, data?: object): void
    abstract logError(errorName: string, data?: object): void
}

