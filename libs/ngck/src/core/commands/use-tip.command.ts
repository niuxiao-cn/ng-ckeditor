import {CommandItem} from "../interfaces";
import {Command, TextSelection} from "prosemirror-state";
import {Mark} from "prosemirror-model";

export class UseTipCommand implements CommandItem {
    name = "use_tip";

    command(): Command {
        return (state, dispatch) => {
            const {tr} = state;
            let start = 0;
            let end = 0;
            let tip: Mark | null = null
            state.doc.nodesBetween(0, state.doc.content.size, (node, index) => {
                if(node.marks.some(item => item.type.name === "tip") && !tip) {
                    start = index;
                    end = index + node.nodeSize;
                    tip = node.marks.find(item => item.type.name === "tip") ?? null;
                }
            })

            if(tip) {
                tr.removeMark(start, end);
                tr.setSelection(TextSelection.create(tr.doc, end));
            }
            dispatch?.(tr)
            return true;
        };
    }

}
