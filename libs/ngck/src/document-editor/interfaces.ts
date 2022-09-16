import {Node, Schema} from "prosemirror-model";
import {EditorView} from "prosemirror-view";
import {Transaction} from "prosemirror-state";

export abstract class DocumentEditor {
    abstract parseContent(value: string | Record<string, unknown> | null, schema: Schema): Node
    abstract toHTML(view: EditorView): string
    abstract removeTipMark(tr: Transaction): Transaction
}
