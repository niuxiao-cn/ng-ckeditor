import {Extractor, Normalizer, Reducer, Styles, StylesProcessor, StyleValue, PropertyDescriptor} from "./styles";
import {get, isObject, merge} from "lodash-es";
import {StyleTools} from "./interfaces";

export class StylesProcessorModel implements StylesProcessor {
    private readonly _normalizers: Map<string, Normalizer> = new Map()
    private readonly _extractors: Map<string, Extractor> = new Map()
    private readonly _reducers: Map<string, Reducer> = new Map()
    private readonly _consumables: Map<string, string[]> = new Map()

    constructor(private tools: StyleTools) {}

    toNormalizedForm(name: string, propertyValue: StyleValue, styles: Styles) {
        if(isObject(propertyValue)) {
            this.tools.appendStyleValue(styles, this.tools.toPath(name), propertyValue)
            return
        }

        if(this._normalizers.has(name)) {
            const normalizer = this._normalizers.get(name) as Normalizer
            const {path, value} = normalizer(propertyValue)
            this.tools.appendStyleValue(styles, path, value)
            return
        }
        this.tools.appendStyleValue(styles, name, propertyValue)
    }

    getNormalized(name: string | undefined, styles: Styles): StyleValue {
        if(!name) {
            return merge({}, styles)
        }

        if(styles[name] !== undefined) {
            return styles[name]
        }

        if(this._extractors.has(name)) {
            const extractor = this._extractors.get(name) as (Extractor | string)
            if(typeof extractor === 'string') {
                return get(styles, extractor)
            }
            const value = extractor(name, styles)
            if(value) {
                return value
            }
        }

        return get(styles, this.tools.toPath(name))
    }

    getReducedForm(name: string, styles: Styles): PropertyDescriptor[] {
        const normalizedValue = this.getNormalized(name, styles)
        if(normalizedValue === undefined) {
            return []
        }

        if(this._reducers.has(name)) {
            const reducer = this._reducers.get(name) as Reducer
            return reducer(normalizedValue)
        }
        return [ [name, normalizedValue as string] ]
    }


    getStylesNames(styles: Styles): string[] {
        const expandedStyleNames = Array.from(this._consumables.keys()).filter(name => {
            const style = this.getNormalized(name, styles)
            if(style && typeof style === 'object') {
                return !!Object.keys(style).length
            }
            return !!style
        })
        const styleNamesKeysSet = new Set([
            ...expandedStyleNames,
            ...Object.keys(styles)
        ])

        return Array.from(styleNamesKeysSet.values())
    }

    getRelatedStyles(name: string): string[] {
        return this._consumables.get(name) ?? []
    }

    setNormalizer(name: string, callback: Normalizer) {
        this._normalizers.set(name, callback)
    }

    setExtractor(name: string, callbackOrPath: Extractor) {
        this._extractors.set(name, callbackOrPath)
    }

    setReducer(name: string, callback: Reducer) {
        this._reducers.set(name, callback)
    }

    setStyleRelation(shorthandName: string, styleNames: string[]) {
        this._mapStyleNames(shorthandName, styleNames)
        for(const alsoName of styleNames) {
            this._mapStyleNames(alsoName, [shorthandName])
        }
    }

    private _mapStyleNames(name: string, styleNames: string[]) {
        if(!this._consumables.has(name)) {
            this._consumables.set(name, [])
        }
        this._consumables.get(name)?.push(...styleNames)
    }
}
