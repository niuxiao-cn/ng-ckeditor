import {Inject, Injectable} from "@angular/core";
import {Editor, PLUGIN} from "./interfaces";
import {nodes, marks} from "prosemirror-schema-basic";
import {EditorState as State, Plugin} from "prosemirror-state";
import {MarkSpec, Schema} from "prosemirror-model";

@Injectable()
export class EditorState extends Editor {
    static tipMark: MarkSpec = {
        attrs: {},
        parseDOM: [
            {
                tag: "span[data-tip]",
            }
        ],
        toDOM() {
            return ["span", {"data-tip": "", style: "color: #999;user-select: none;"}, 0]
        }
    }

    state = State.create({
        schema: new Schema({nodes: {...nodes}, marks: {...marks, tip: EditorState.tipMark}}), plugins: this.plugins
    });


    constructor(@Inject(PLUGIN) private plugins: Plugin[]) {
        super();
        this.set({tipIndex: 0});
    }
}
