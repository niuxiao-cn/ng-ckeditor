import {Collection, CollectionBindToChain, Utils} from "./interfaces";

export class CollectionModel<T extends {[id in I]?: string}, I extends string = 'id'> implements Collection<T, I> {
    private readonly _items: T[];
    private readonly _itemMap: Map<string, T>;

    private readonly _idProperty: I;

    _bindToCollection?: Collection<object, string> | null;

    readonly _bindToExternalToInternalMap: WeakMap<object, T>;

    readonly _bindToInternalToExternalMap: WeakMap<T, unknown>;

    _skippedIndexesFromExternal: number[];

    constructor(utils: Utils, options?: { readonly idProperty?: I } );
    constructor(utils: Utils, initialItems: Iterable<T>, options?: { readonly idProperty?: I } );

    constructor(private utils: Utils, initialItemsOrOptions: Iterable<T> | { readonly idProperty?: I } = {}, options: { readonly idProperty?: I } = {} ) {
        const hasInitialItems = utils.isIterable(initialItemsOrOptions)
        if(!hasInitialItems) {
            options = initialItemsOrOptions
        }

        this._items = []
        this._itemMap = new Map()
        this._idProperty = options.idProperty || 'id' as I;
        this._bindToExternalToInternalMap = new WeakMap();
        this._bindToInternalToExternalMap = new WeakMap();
        this._skippedIndexesFromExternal = [];

        if ( hasInitialItems ) {
            for ( const item of initialItemsOrOptions ) {
                this._items.push( item );
                this._itemMap.set( this._getItemIdBeforeAdding( item ), item );
            }
        }
    }

    get length(): number {
        return this._items.length;
    }

    get first(): T | null {
        return this._items[ 0 ] || null;
    }

    get last(): T | null {
        return this._items[ this.length - 1 ] || null;
    }

    add( item: T, index?: number ): this {
        return this.addMany( [ item ], index );
    }

    addMany( items: Iterable<T>, index?: number ): this {
        if ( index === undefined ) {
            index = this._items.length;
        } else if ( index > this._items.length || index < 0 ) {
            throw this.utils.getError("collection-add-item-invalid-index", this)
        }

        let offset = 0;
        for ( const item of items ) {
            const itemId = this._getItemIdBeforeAdding( item );
            const currentItemIndex = index + offset;
            this._items.splice( currentItemIndex, 0, item );
            this._itemMap.set( itemId, item );
            offset++;
        }

        return this
    }

    get( idOrIndex: string | number ): T | null {
        let item: T | undefined;
        if ( typeof idOrIndex === 'string' ) {
            item = this._itemMap.get( idOrIndex );
        } else {
            item = this._items[ idOrIndex ];
        }

        return item || null
    }

    has( itemOrId: T | string ): boolean {
        if ( typeof itemOrId == 'string' ) {
            return this._itemMap.has( itemOrId );
        } else {
            const idProperty = this._idProperty;
            const id = itemOrId[ idProperty ];

            return id && this._itemMap.has( id );
        }
    }

    getIndex( itemOrId: T | string ): number {
        let item: T | undefined;

        if ( typeof itemOrId == 'string' ) {
            item = this._itemMap.get( itemOrId );
        } else {
            item = itemOrId;
        }

        return item ? this._items.indexOf( item ) : -1;
    }

    remove( subject: T | number | string ): T {
        const [ item, index ] = this._remove( subject );

        return item;
    }

    map<U>(
        callback: ( item: T, index: number ) => U,
        ctx?: unknown
    ): U[] {
        return this._items.map( callback, ctx );
    }

    find(
        callback: ( item: T, index: number ) => boolean,
        ctx?: unknown
    ): T | undefined {
        return this._items.find( callback, ctx );
    }

    filter(
        callback: ( item: T, index: number ) => boolean,
        ctx?: unknown
    ): T[] {
        return this._items.filter( callback, ctx );
    }

    clear(): void {
        if(this._bindToCollection) {
            this._bindToCollection = null
        }
        while ( this.length ) {
            this._remove( 0 );
        }
    }

    bindTo<S extends { [id in I2]?: string }, I2 extends string>(
        externalCollection: Collection<S, I2>
    ): CollectionBindToChain<S, T> {
        if(this._bindToCollection) {
            throw this.utils.getError("collection-bind-to-rebind", this)
        }
        this._bindToCollection = externalCollection

        return {
            as: Class => {
                this._setUpBindToBinding<S>(item => new Class(item))
            },
            using: callbackOrProperty => {
                if ( typeof callbackOrProperty == 'function' ) {
                    this._setUpBindToBinding<S>( callbackOrProperty );
                } else {
                    this._setUpBindToBinding<S>( item => item[ callbackOrProperty ] as never );
                }
            }
        }
    }

    private _setUpBindToBinding<S extends object>( factory: ( item: S ) => T | null ): void {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const externalCollection = this._bindToCollection!
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const addItem = ( evt: unknown, externalItem: S, index: number ) => {
            const isExternalBoundToThis = externalCollection._bindToCollection === this as unknown;
            const externalItemBound = externalCollection._bindToInternalToExternalMap.get( externalItem );

            if ( isExternalBoundToThis && externalItemBound ) {
                this._bindToExternalToInternalMap.set( externalItem, externalItemBound as T );
                this._bindToInternalToExternalMap.set( externalItemBound as T, externalItem );
            } else {
                const item = factory( externalItem );
                if ( !item ) {
                    this._skippedIndexesFromExternal.push( index );

                    return;
                }
                let finalIndex = index;
                for ( const skipped of this._skippedIndexesFromExternal ) {
                    if ( index > skipped ) {
                        finalIndex--;
                    }
                }

                for ( const skipped of externalCollection._skippedIndexesFromExternal ) {
                    if ( finalIndex >= skipped ) {
                        finalIndex++;
                    }
                }

                this._bindToExternalToInternalMap.set( externalItem, item );
                this._bindToInternalToExternalMap.set( item, externalItem );
                this.add( item, finalIndex );

                for ( let i = 0; i < externalCollection._skippedIndexesFromExternal.length; i++ ) {
                    if ( finalIndex <= externalCollection._skippedIndexesFromExternal[ i ] ) {
                        externalCollection._skippedIndexesFromExternal[ i ]++;
                    }
                }
            }

            for ( const externalItem of externalCollection ) {
                addItem( null, externalItem as S, externalCollection.getIndex( externalItem ) );
            }

        }
    }

    private _getItemIdBeforeAdding( item: { [ id in I ]?: string } ): string {
        const idProperty = this._idProperty;
        let itemId: string | undefined;
        if ((idProperty in item)) {
            itemId = item[idProperty];

            if ( this.get( itemId as string ) ) {
                throw this.utils.getError("collection-add-item-already-exists", this)
            }
        } else {
            item[ idProperty ] = itemId = this.utils.uid();
        }
        return itemId as string
    }

    private _remove( subject: T | number | string ): [ item: T, index: number ] {
        let index: number, id: string, item: T;
        let itemDoesNotExist = false;

        const idProperty = this._idProperty;
        if ( typeof subject == 'string' ) {
            id = subject;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            item = this._itemMap.get( id )!;
            itemDoesNotExist = !item;
            if ( item ) {
                index = this._items.indexOf( item );
            }
        } else if ( typeof subject == 'number' ) {
            index = subject;
            item = this._items[ index ];
            itemDoesNotExist = !item;

            if ( item ) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                id = item[ idProperty ]!;
            }
        } else {
            item = subject;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            id = item[ idProperty ]!;
            index = this._items.indexOf( item );
            itemDoesNotExist = ( index == -1 || !this._itemMap.get( id ) );
        }

        if ( itemDoesNotExist ) {
            throw this.utils.getError("collection-remove-404", this)
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._items.splice( index!, 1 );
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this._itemMap.delete( id! );

        const externalItem = this._bindToInternalToExternalMap.get( item );
        this._bindToInternalToExternalMap.delete( item );
        this._bindToExternalToInternalMap.delete( externalItem as object );

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return [item, index!]
    }

    [ Symbol.iterator ](): Iterator<T> {
        return this._items[ Symbol.iterator ]();
    }
}
