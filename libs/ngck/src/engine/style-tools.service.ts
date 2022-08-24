import {Injectable} from "@angular/core";
import {StyleTools} from "./interfaces";
import {Styles, StylesMap, StylesProcessor, StyleValue} from "./styles";
import {StylesProcessorModel} from "./styles-processor-model";
import {get, isObject, merge, set} from "lodash-es";
import {StylesMapModel} from "./styles-map-model";

@Injectable()
export class StyleToolsService implements StyleTools {
    getStylesProcessor(): StylesProcessor {
        return new StylesProcessorModel(this)
    }

    getStylesMap(processor: StylesProcessor): StylesMap {
        return new StylesMapModel(this, processor);
    }

    appendStyleValue(stylesObject: Styles, nameOrPath: string, valueOrObject: StyleValue) {
        let valueToSet = valueOrObject

        if(isObject(valueOrObject)) {
            valueToSet = merge({}, get(stylesObject, nameOrPath), valueOrObject)
        }
        set(stylesObject, nameOrPath, valueToSet)
    }

    toPath(name: string): string {
        return name.replace("-", ".");
    }

    parseInlineStyles(stylesString: string): Map<string, string> {
        let quoteType = null
        let propertyNameStart = 0
        let propertyValueStart = 0
        let propertyName = null

        const stylesMap = new Map()

        if(stylesString === '') {
            return stylesMap
        }

        if(stylesString.charAt(stylesString.length - 1) !== ';') {
            stylesString = stylesString + ';'
        }

        for(let i = 0; i < stylesString.length; i++) {
            const char = stylesString.charAt(i)
            if(quoteType === null) {
                switch(char) {
                    case ":":
                        if(!propertyName) {
                            propertyName = stylesString.substring(propertyNameStart, i - propertyNameStart)
                            propertyValueStart = i + 1
                        }
                        break;
                    case '"':
                    case '\'':
                        quoteType = char
                        break;
                    case ";": {
                        const propertyValue = stylesString.substring(propertyValueStart, i - propertyValueStart)
                        if (propertyName) {
                            stylesMap.set(propertyName.trim(), propertyValue.trim())
                        }
                        propertyName = null
                        propertyNameStart = i + 1
                        break;
                    }
                }
            } else if(char === quoteType) {
                quoteType = null
            }
        }
        return stylesMap
    }
}
