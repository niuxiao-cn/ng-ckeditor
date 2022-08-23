import {CKEditorError} from "./interfaces";

export const DOCUMENTATION_URL = 'https://ckeditor.com/docs/ckeditor5/latest/support/error-codes.html';

export class NgCKEditorError extends Error implements CKEditorError {
    public readonly context: object | null | undefined;
    public readonly data?: object;

    constructor(errorName: string, context: object | null | undefined, data?: object) {
        super(getErrorMessage(errorName, data))
        this.name = "CKEditorError"
        this.context = context
        this.data = data
    }

    is(type: string): boolean {
        return type === "CKEditorError"
    }
}

function getLinkToDocumentationMessage( errorName: string ): string {
    return `\nRead more: ${ DOCUMENTATION_URL }#error-${ errorName }`;
}

function getErrorMessage(errorName: string, data?: object): string {
    const processedObjects = new WeakSet()
    const circularReferencesReplacer = ( key: string, value: unknown ) => {
        if ( typeof value === 'object' && value !== null ) {
            if ( processedObjects.has( value ) ) {
                return `[object ${ value.constructor.name }]`;
            }

            processedObjects.add( value );
        }

        return value;
    };
    const stringifiedData = data ? ` ${ JSON.stringify( data, circularReferencesReplacer ) }` : ''
    const documentationLink = getLinkToDocumentationMessage( errorName );
    return errorName + stringifiedData + documentationLink
}

function formatConsoleArguments( errorName: string, data?: object ): unknown[] {
    const documentationMessage = getLinkToDocumentationMessage( errorName );

    return data ? [ errorName, data, documentationMessage ] : [ errorName, documentationMessage ];
}

export function logWarning( errorName: string, data?: object ): void {
    console.warn( ...formatConsoleArguments( errorName, data ) );
}

export function logError( errorName: string, data?: object ): void {
    console.error( ...formatConsoleArguments( errorName, data ) );
}
