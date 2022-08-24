import {PropertyDescriptor, Styles, StylesMap, StylesProcessor, StyleValue} from "./styles";
import {map} from "rxjs";
import {StyleTools} from "./interfaces";
import {produce} from "immer";
import {get, isObject, unset} from "lodash-es";

export class StylesMapModel extends StylesMap {
    readonly isEmpty$ = this.select("styles").pipe(
        map(styles => this._isEmpty(styles))
    )

    readonly size$ = this.select("styles").pipe(
        map(styles => {
            if(this._isEmpty(styles)) {
                return 0
            }
            return this.getStyleNames(styles).length
        })
    )

    readonly stylesSting$ = this.select("styles").pipe(
        map(styles => this._toString(styles))
    )

    constructor(private tools: StyleTools, private _processor: StylesProcessor) {
        super();
        this.set({styles: {}})
    }

    get isEmpty(): boolean {
        return this._isEmpty(this.get().styles)
    }

    get size(): number {
        return this._isEmpty(this.get().styles) ? 0 : this.getStyleNames(this.get().styles).length
    }

    getStyleNames(styles: Record<string, string>, expand = false): string[] {
        if(this._isEmpty(styles)) {
            return []
        }
        if(expand) {
            return this._processor.getStylesNames(styles)
        }
        return this._getStylesEntries(styles).map(([key])=> key);
    }

    setTo(inlineStyle: string) {
        this.set("styles", ({styles}) => produce(styles, draft => {
            draft = {}
            const parsedStyles = Array.from(this.tools.parseInlineStyles(inlineStyle).entries())

            for(const [key, value] of parsedStyles) {
                this._processor.toNormalizedForm(key, value, draft)
            }
        }))
    }

    has(name: string): boolean {
        if(this._isEmpty(this.get().styles)) {
            return false
        }
        const styles = this._processor.getReducedForm(name, this.get().styles)
        const propertyDescriptor = styles.find(([property]) => property === name)

        return Array.isArray(propertyDescriptor)
    }

    setStyle(name: Styles): void
    setStyle( nameOrObject: string, valueOrObject: StyleValue): void
    setStyle(name: string | Styles, value?: StyleValue) {
        this.set("styles", ({styles}) => produce(styles, draft => {
            if(isObject(name)) {
                for(const [key, value] of Object.entries(name)) {
                    this._processor.toNormalizedForm(key, value, draft)
                }
            } else if(value !== undefined) {
                this._processor.toNormalizedForm(name, value, draft)
            }
        }))
    }

    toStr(): string {
        return this._toString(this.get().styles);
    }

    remove(name: string) {
        this.set("styles", ({styles}) => produce(styles, draft => this._clearEmptyObjectsOnPath(draft, name)))
    }

    getNormalized(name?: string): StyleValue {
        return this._processor.getNormalized(name, this.get().styles);
    }

    getAsString(propertyName: string): string | undefined {
        const styles = this.get().styles
        if(this._isEmpty(styles)) {
            return
        }
        if(styles[propertyName] && !isObject(styles[propertyName])) {
            return styles[propertyName]
        }
        const _styles = this._processor.getReducedForm(propertyName, styles)
        const propertyDescriptor = _styles.find(([property]) => property === propertyName)

        if(Array.isArray(propertyDescriptor)) {
            return propertyDescriptor[ 1 ]
        }
        return undefined
    }

    clear() {
        this.set({styles: {}})
    }

    private _isEmpty(styles: Record<string, string>): boolean {
        const entries = Object.entries(styles)
        const from = Array.from(entries)
        return !from.length
    }

    private _getStylesEntries(styles: Record<string, string>): PropertyDescriptor[] {
        const parsed: PropertyDescriptor[] = []

        const keys = Object.keys(styles)
        for(const key of keys) {
            parsed.push(...this._processor.getReducedForm(key, styles))
        }
        return parsed
    }

    private _remove(styles: Record<string, string>, name: string) {
        const path = this.tools.toPath(name)
        unset(styles, path)
        delete styles[name]
        this._clearEmptyObjectsOnPath(styles, path)
    }

    private _toString(styles: Record<string, string>): string {
        if(this._isEmpty(styles)) {
            return ""
        }
        return this._getStylesEntries(styles).map(arr => arr.join(':')).sort().join(";") + ";"
    }

    private _clearEmptyObjectsOnPath(styles: Record<string, string>, path: string): void {
        const pathParts = path.split('.')
        const isChildPath = pathParts.length > 1

        if(!isChildPath) {
            return
        }

        const parentPath = pathParts.splice(0, pathParts.length - 1).join('.')

        const parentObject = get(styles, parentPath)

        if(!parentObject) {
            return
        }
        const isParentEmpty = !Array.from(Object.keys(parentObject)).length
        if(isParentEmpty) {
            this._remove(styles, parentPath)
        }
    }
}
