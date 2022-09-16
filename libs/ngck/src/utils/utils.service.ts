import {Injectable} from "@angular/core";
import {ArrayOrItem, ArrayRelation, CKEditorError, Utils, Collection} from "./interfaces";
import {logError, logWarning, NgCKEditorError} from "./ck-editor-error";
import {CollectionModel} from "./collection";

@Injectable()
export class UtilsService implements Utils {
    static HEX_NUMBERS = new Array( 256 ).fill( '' ).map( ( _, index ) => ( '0' + ( index ).toString( 16 ) ).slice( -2 ) );

    getError(errorName: string, context: object | null | undefined, data?: object): CKEditorError {
        return new NgCKEditorError(errorName, context, data)
    }

    throwError(err: Error, context: object) {
        if ( ( err as CKEditorError ).is && ( err as CKEditorError ).is( 'CKEditorError' ) ) {
            throw err;
        }
        const error = new NgCKEditorError(err.message, context)
        error.stack = err.stack
        throw error
    }

    logWarning(errorName: string, data?: object) {
        logWarning(errorName, data)
    }

    logError(errorName: string, data?: object) {
        logError(errorName, data)
    }

    compareArrays( a: readonly unknown[], b: readonly unknown[] ): ArrayRelation | number {
        const minLen = Math.min( a.length, b.length );

        for ( let i = 0; i < minLen; i++ ) {
            if ( a[ i ] != b[ i ] ) {
                return i;
            }
        }

        if ( a.length == b.length ) {
            return 'same';
        } else if ( a.length < b.length ) {
            return 'prefix';
        } else {
            return 'extension';
        }
    }

    isIterable(value: unknown): value is Iterable<unknown> {
        return !!(value && (value as Iterable<unknown>)[Symbol.iterator]);
    }

    objectToMap<T>(obj: { [p: string]: T } | null | undefined): Map<string, T> {
        const map = new Map<string, T>()
        for(const key in obj) {
            map.set(key, obj[key])
        }
        return map
    }

    toMap<T>(data: { readonly [ key: string ]: T } | Iterable<readonly [ string, T ]> | null | undefined): Map<string, T> {
        if(this.isIterable(data)) {
            return new Map(data)
        }
        return this.objectToMap(data)
    }

    toArray<T>(data: ArrayOrItem<T>): T[] {
        return Array.isArray(data) ? data : [data]
    }

    getCollection<T extends { [id in I]?: string }, I extends string = "id">(initialItemsOrOptions?: Iterable<T> | { readonly idProperty?: I }, options?: { readonly idProperty?: I }): Collection<T, I> {
        if(this.isIterable(initialItemsOrOptions)) {
            return new CollectionModel<T, I>(this, initialItemsOrOptions as Iterable<T>, options)
        }
        return new CollectionModel<T, I>(this, initialItemsOrOptions)
    }

    uid(): string {
        const r1 = Math.random() * 0x100000000 >>> 0;
        const r2 = Math.random() * 0x100000000 >>> 0;
        const r3 = Math.random() * 0x100000000 >>> 0;
        const r4 = Math.random() * 0x100000000 >>> 0;
        return 'e' +
            UtilsService.HEX_NUMBERS[r1 >> 0 & 0xFF] +
            UtilsService.HEX_NUMBERS[ r1 >> 8 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r1 >> 16 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r1 >> 24 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r2 >> 0 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r2 >> 8 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r2 >> 16 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r2 >> 24 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r3 >> 0 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r3 >> 8 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r3 >> 16 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r3 >> 24 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r4 >> 0 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r4 >> 8 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r4 >> 16 & 0xFF ] +
            UtilsService.HEX_NUMBERS[ r4 >> 24 & 0xFF ];
    }

    getAncestors(node: Node): Node[] {
        const nodes: Node[] = []
        let currentNode: Node | null = node
        while (currentNode && currentNode.nodeType !== Node.DOCUMENT_NODE) {
            nodes.unshift(currentNode)
            currentNode = currentNode.parentNode
        }
        return nodes;
    }
}
