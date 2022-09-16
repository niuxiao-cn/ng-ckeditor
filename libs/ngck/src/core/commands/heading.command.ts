import {CommandItem, CommandQuery} from "../interfaces";
import {Command, EditorState} from "prosemirror-state";
import {NodeType, Node} from "prosemirror-model";
import {setBlockType} from "prosemirror-commands";

export class HeadingCommand implements CommandItem {
    name = "heading";
    command(query?: CommandQuery): Command {
        return (state, dispatch) => {
            const { schema, selection, doc } = state;
            const level = parseInt(query?.get("level") ?? "0");
            const type: NodeType = schema.nodes['heading'];
            if(!type) {
                return false;
            }
            const nodePos = selection.$from.before(1);
            const node = doc.nodeAt(nodePos);
            const attrs = node?.attrs ?? {};

            if(this.isActive(state, level)) {
                return setBlockType(schema.nodes["paragraph"], attrs)(state, dispatch);
            }

            return setBlockType(type, {...attrs, level})(state, dispatch);
        }
    }

    private isActive(state: EditorState, level: number): boolean {
        const { schema, selection } = state;
        const nodesInSelection: Node[] = [];

        state.doc.nodesBetween(selection.from, selection.to, node => {
            nodesInSelection.push(node);
        });

        const type: NodeType = schema.nodes['heading'];
        if (!type) {
            return false;
        }

        const supportedNodes = [
            type,
            schema.nodes['text'],
            schema.nodes['blockquote'],
        ];

        const nodes = nodesInSelection.filter((node) => {
            return supportedNodes.includes(node.type);
        });

        const activeNode = nodes.find((node: Node) => {
            return node.attrs['level'] === level;
        });

        return Boolean(activeNode);
    }
}
