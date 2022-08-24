import {Injectable} from "@angular/core";
import {ArrayOrItem, ArrayRelation, CKEditorError, Utils} from "./interfaces";
import {logError, logWarning, NgCKEditorError} from "./ck-editor-error";

@Injectable()
export class UtilsService implements Utils {
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
}
