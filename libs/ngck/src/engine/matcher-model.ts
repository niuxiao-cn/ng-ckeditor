import {DocTools, Element, Matcher, MatcherPattern, MatchResult} from "./interfaces";

export class MatcherModel implements Matcher {
    private readonly _patterns: Exclude<MatcherPattern, string | RegExp>[] = []
    constructor(private docTools: DocTools, ...patterns: MatcherPattern[]) {
        this.add(...patterns)
    }

    add(...patterns: MatcherPattern[]) {
        for(let item of patterns) {
            if(typeof item === 'string' || item instanceof RegExp) {
                item = {name: item}
            }
            this._patterns.push(item)
        }
    }

    match(...element: Element[]): MatchResult | null {
        let result: MatchResult | null = null
        this._match(element, (r) => {
            result = r
            return true
        })
        return result
    }

    matchAll(...element: Element[]): MatchResult[] | null {
        const results: MatchResult[] = []
        this._match(element, r => {
            results.push(r)
        })
        return results.length > 0 ? results : null
    }

    getElementName(): string | null {
        if(this._patterns.length !== 1) {
            return null
        }
        const pattern = this._patterns[0]
        const name = pattern.name
        return (typeof pattern !== "function" && !!name && !(name instanceof RegExp)) ? name : null
    }

    private _match(elements: Element[], fn: (result: MatchResult) => boolean | void) {
        for(const element of elements) {
            for(const pattern of this._patterns) {
                const match = this.docTools.match.isElementMatching(element, pattern)
                if(match && !!fn({element, pattern, match})) {
                    return
                }
            }
        }
    }
}
