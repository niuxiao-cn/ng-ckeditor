import {Injectable} from "@angular/core";
import {DocumentEditor} from "./interfaces";
import {DOMParser, Schema, Node, DOMSerializer, Mark} from "prosemirror-model";
import {EditorView} from "prosemirror-view";
import {Transaction} from "prosemirror-state";

@Injectable()
export class DocumentEditorService implements DocumentEditor {
     toDoc(html: string, schema: Schema): Record<string, unknown> {
         const div = document.createElement("div");
         div.innerHTML = html;
         return DOMParser.fromSchema(schema).parse(div).toJSON();
     }

     parseContent(value: string | Record<string, unknown> | null, schema: Schema): Node {
         if(!value) {
             return schema.nodeFromJSON({type: "doc", content: [{type: "paragraph"}]})
         }
         if(typeof value !== "string") {
             return schema.nodeFromJSON(value);
         }
         return schema.nodeFromJSON(this.toDoc(value, schema));
     }

     toHTML(view: EditorView): string {
         const html = DOMSerializer.fromSchema(view.state.schema).serializeFragment(view.state.doc.content);
         const div = document.createElement("div");
         div.append(html);
         return div.innerHTML;
     }

     removeTipMark(tr: Transaction): Transaction {
         let tipMark: Mark | null = null;
         let tipStart = 0;
         let tipEnd = 0;
         tr.doc.nodesBetween(0, tr.doc.content.size, (node, index) => {
             if(node.marks.length > 0 && node.marks.some(item => item.type.name === "tip") && !tipMark) {
                 tipStart = index;
                 tipEnd = index + node.nodeSize;
                 tipMark = node.marks.find(item => item.type.name === "tip") ?? null;
             }
         })

         if(tipMark) {
             tr.delete(tipStart, tipEnd);
         }

         return tr
     }

}
