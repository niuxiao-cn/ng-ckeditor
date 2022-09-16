import { Injectable } from "@angular/core";
import {Filters, DomText, DomNode} from "./api/converter";

@Injectable()
export class DomFiltersService implements Filters {
    readonly PRE_ELEMENTS = new Set<string>(["pre"]);

    readonly BLOCK_ELEMENTS = new Set<string>([
        'address', 'article', 'aside', 'blockquote', 'caption', 'center', 'dd', 'details', 'dir', 'div',
        'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header',
        'hgroup', 'legend', 'li', 'main', 'menu', 'nav', 'ol', 'p', 'pre', 'section', 'summary', 'table', 'tbody',
        'td', 'tfoot', 'th', 'thead', 'tr', 'ul'
    ]);

    readonly INLINE_OBJECT_ELEMENTS = new Set<string>([
        'object', 'iframe', 'input', 'button', 'textarea', 'select', 'option', 'video', 'embed', 'audio', 'img', 'canvas'
    ]);

    private readonly INLINE_FILLER_LENGTH = 7;
    private readonly INLINE_FILLER = '\u2060'.repeat( this.INLINE_FILLER_LENGTH )

    BR_FILTER(): HTMLBRElement {
        const filter = document.createElement("br")
        filter.dataset['ckeFilter'] = "true"
        return filter
    }

    isInlineFilter(domText: DomText): boolean {
        return domText.data.length === this.INLINE_FILLER_LENGTH && this.startsWithFiller(domText)
    }

    isText(node: unknown): node is DomText {
        return Object.prototype.toString.call(node) === "[object Text]"
    }

    getDataWithoutFiller(domText: DomText): string {
        if(this.startsWithFiller(domText)) {
            return domText.data.slice(this.INLINE_FILLER_LENGTH)
        }
        return domText.data
    }

    startsWithFiller( domNode: DomNode ): boolean {
        return this.isText(domNode) && domNode.data.substring(0, this.INLINE_FILLER_LENGTH) === this.INLINE_FILLER
    }
}
