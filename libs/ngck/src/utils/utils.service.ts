import {Injectable} from "@angular/core";
import {CKEditorError, Utils} from "./interfaces";
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
}
