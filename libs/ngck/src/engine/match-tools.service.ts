import {Injectable} from "@angular/core";
import {Match, MatcherPattern, MatchTools, Element, PropertyPatterns, ClassPatterns} from "./interfaces";
import {isPlainObject} from "lodash-es";
import {Utils} from "../utils";

@Injectable()
export class MatchToolsService implements MatchTools {
    constructor(private utils: Utils) {
    }
    isElementMatching(element: Element, pattern: Exclude<MatcherPattern, string | RegExp>): Match | null {
        if(typeof pattern === "function") {
            return pattern(element)
        }

        const match: Match = {}
        if(pattern.name) {
            match.name = this.matchName(pattern.name, element.name)
            if(!match.name) {
                return null
            }
        }

        if(pattern.attributes) {
            match.attributes = this.matchAttributes(pattern.attributes, element)
            if(!match.attributes) {
                return null
            }
        }

        if(pattern.classes) {
            match.classes = this.matchClasses(pattern.classes, element)
            if(!match.classes) {
                return null
            }
        }

        if(pattern.styles) {
            match.styles = this.matchStyles(pattern.styles, element)
            if(!match.styles) {
                return null
            }
        }

        return null
    }

    matchName(pattern: string | RegExp, name: string): boolean {
        if(pattern instanceof RegExp) {
            return !!name.match(pattern)
        }
        return pattern === name
    }

    matchPatterns(patterns: PropertyPatterns, keys: Iterable<string>, valueGetter?: (value: string) => unknown): string[] | undefined {
        const normalizedPatterns = this.normalizePatterns(patterns)
        const normalizedItems = Array.from(keys)
        const match: string[] = []

        normalizedPatterns.forEach(([patternKey, patternValue]) => {
            normalizedItems.forEach(itemKey => {
                if(this.isKeyMatched(patternKey, itemKey) && this.isValueMatched(patternValue, itemKey, valueGetter)) {
                    match.push(itemKey)
                }
            })
        })

        if(!normalizedPatterns.length || match.length < normalizedPatterns.length) {
            return undefined
        }
        return match
    }

    normalizePatterns(patterns: PropertyPatterns): [(true | string | RegExp), (true | string | RegExp)][] {
        if(Array.isArray(patterns)) {
            return (patterns as (string | RegExp | {key: string | RegExp, value: string | RegExp})[]).map(pattern => {
                if(isPlainObject(pattern)) {
                    const _p = pattern as {key: string | RegExp; value: string | RegExp}
                    if(_p.key === undefined || _p.value === undefined ) {
                        this.utils.logWarning('matcher-pattern-missing-key-of-value', _p)
                    }
                    return [_p.key, _p.value]
                }
                return [pattern as string | RegExp,  true]
            })
        }
        return [];
    }

    isKeyMatched(patternKey: true | string | RegExp, itemKey: string): boolean {
        return patternKey === true || (patternKey instanceof RegExp && !!itemKey.match(patternKey)) || patternKey === itemKey
    }

    isValueMatched(patternValue: true | string | RegExp, itemKey: string, valueGetter?: (value: string) => unknown): boolean {
        if(patternValue === true) {
            return true
        }
        const itemValue = valueGetter?.(itemKey) ?? ""
        return (patternValue instanceof RegExp && !!String(itemValue).match(patternValue)) || patternValue === itemValue
    }

    matchAttributes(patterns: PropertyPatterns, element: Element): string[] | undefined {
        const attributeKeys = new Set(element.getAttributeKeys())
        if(isPlainObject(patterns)) {
            const patternsObj = patterns as Record<string, string | true | RegExp>
            if(patternsObj['style'] !== undefined) {
                this.utils.logWarning("matcher-pattern-deprecated-attributes-style-key", patternsObj)
            }
            if(patternsObj['class'] !== undefined) {
                this.utils.logWarning("matcher-pattern-deprecated-attributes-class-key", patternsObj)
            }
        } else {
            attributeKeys.delete('style')
            attributeKeys.delete('class')
        }
        return this.matchPatterns(patterns, attributeKeys, key => element.getAttribute(key))
    }

    matchClasses(patterns: ClassPatterns, element: Element): string[] | undefined {
        return this.matchPatterns(patterns, element.getClassNames())
    }

    matchStyles(patterns: PropertyPatterns, element: Element): string[] | undefined {
        return this.matchPatterns(patterns, element.getStyleNames(true), key => element.getStyle(key))
    }
}
