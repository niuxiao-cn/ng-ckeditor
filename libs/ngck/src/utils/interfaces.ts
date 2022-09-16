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
    abstract getCollection<T extends {[id in I]?: string}, I extends string = 'id'>(options?: { readonly idProperty?: I }): Collection<T, I>
    abstract getCollection<T extends {[id in I]?: string}, I extends string = 'id'>(initialItems: Iterable<T>, options?: { readonly idProperty?: I } ): Collection<T, I>
    abstract uid(): string
    abstract getAncestors(node: Node): Node[]
}

export type ArrayOrItem<T> = T | T[];
export type ReadonlyArrayOrItem<T> = T | readonly T[];

export interface Collection<T extends {[id in I]?: string}, I extends string = 'id'> extends Iterable<T>  {
    _bindToCollection?: Collection<object, string> | null;

    readonly _bindToExternalToInternalMap: WeakMap<object, T>;

    readonly _bindToInternalToExternalMap: WeakMap<T, unknown>;

    _skippedIndexesFromExternal: number[];

    get length(): number
    get first(): T | null
    get last(): T | null
    add( item: T, index?: number ): this
    addMany( items: Iterable<T>, index?: number ): this
    get( idOrIndex: string | number ): T | null
    has( itemOrId: T | string ): boolean
    getIndex( itemOrId: T | string ): number
    remove( subject: T | number | string ): T
    map<U>(
        callback: ( item: T, index: number ) => U,
        ctx?: unknown
    ): U[]
    find(
        callback: ( item: T, index: number ) => boolean,
        ctx?: unknown
    ): T | undefined
    filter(
        callback: ( item: T, index: number ) => boolean,
        ctx?: unknown
    ): T[]
    clear(): void
    bindTo<S extends { [id in I2]?: string }, I2 extends string>(
        externalCollection: Collection<S, I2>
    ): CollectionBindToChain<S, T>
}

export interface CollectionBindToChain<S, T> {
    as( Class: new ( item: S ) => T ): void
    using( callbackOrProperty: keyof S | ( ( item: S ) => T | null ) ): void
}


