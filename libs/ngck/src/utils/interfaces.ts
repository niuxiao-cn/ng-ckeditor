export interface CKEditorError extends Error {
    readonly context: object | null | undefined
    readonly data?: object
    name: string

    is(type: string): boolean
}

export type ArrayRelation = 'extension' | 'same' | 'prefix';

export abstract class Utils {
    abstract getError(errorName: string, context: object | null | undefined, data?: object): CKEditorError
    abstract throwError(err: Error, context: object): void
    abstract logWarning(errorName: string, data?: object): void
    abstract logError(errorName: string, data?: object): void
    abstract compareArrays(a: readonly unknown[], b: readonly unknown[]): ArrayRelation | number
    abstract isIterable(value: unknown): value is Iterable<unknown>
    abstract objectToMap<T>(obj: { readonly [ key: string ]: T } | null | undefined ) : Map<string, T>
    abstract toMap<T>(data: { readonly [ key: string ]: T } | Iterable<readonly [ string, T ]> | null | undefined): Map<string, T>
    abstract toArray<T>(data: ArrayOrItem<T>): T[]
    abstract toArray<T>(data: ReadonlyArrayOrItem<T>): readonly T[]
}

export type ArrayOrItem<T> = T | T[];
export type ReadonlyArrayOrItem<T> = T | readonly T[];

