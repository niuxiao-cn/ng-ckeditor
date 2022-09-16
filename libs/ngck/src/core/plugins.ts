import {Plugin} from "prosemirror-state";

export const focusPlugin = () => new Plugin({
    props: {
        handleDOMEvents: {
            "focus": (view) => {
                view.dom.classList.remove("ck-blur");
                view.dom.classList.add("ck-focused");
            },
            "blur": (view) => {
                view.dom.classList.remove("ck-focused");
                view.dom.classList.add("ck-blur");
            }
        }
    }
})
