import {RxState} from "@rx-angular/state";
import {Observable} from "rxjs";

export type Styles = {
    [name: string]: StyleValue
}

export type PropertyDescriptor = [ string, string ];

export type BoxSides = {
    top: undefined | string
    left: undefined | string
    right: undefined | string
    bottom: undefined | string
}

export type StyleValue = string | string[] | Styles | BoxSides

export type Normalizer = (name: string) => {path: string; value: StyleValue}

export type Extractor = string | ((name: string, styles: Styles) => StyleValue | undefined)

export type Reducer = (value: StyleValue) => PropertyDescriptor[]

export abstract class StylesMap extends RxState<{styles: Record<string, string>}> {
    abstract readonly isEmpty$: Observable<boolean>
    abstract readonly size$: Observable<number>
    abstract readonly stylesSting$: Observable<string>
    abstract get isEmpty(): boolean
    abstract get size(): number

    abstract setTo(inlineStyle: string): void

    abstract has(name: string): boolean

    abstract setStyle(name: string, value: StyleValue): void
    abstract setStyle(name: Styles): void

    abstract toStr(): string

    abstract remove(name: string): void
    abstract getNormalized(name?: string): StyleValue
    abstract getAsString(propertyName: string): string | undefined
    abstract getStyleNames(styles: Record<string, string>, expand?: boolean): string[]
    abstract clear(): void
}

export interface StylesProcessor {
    toNormalizedForm(name: string, propertyValue: StyleValue, styles: Styles): void
    getNormalized(name: string | undefined, styles: Styles): StyleValue
    getReducedForm(name: string, styles: Styles): PropertyDescriptor[]
    getStylesNames(styles: Styles): string[]
    getRelatedStyles(name: string): string[]
    setNormalizer(name: string, callback: Normalizer): void
    setExtractor(name: string, callbackOrPath: Extractor): void
    setReducer(name: string, callback: Reducer): void
    setStyleRelation(shorthandName: string, styleNames: string[]): void
}
