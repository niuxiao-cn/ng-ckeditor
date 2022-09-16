import {Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2} from "@angular/core";
import {EditorView} from "prosemirror-view";
import {Editor, CommandService} from "../core";
import {forkJoin, Subject, takeUntil} from "rxjs";
import {DocumentEditor} from "./interfaces";
import {TextSelection, Transaction} from "prosemirror-state";
import {Mark} from "prosemirror-model";
import {selectSlice} from "@rx-angular/state";

@Directive({
    selector: "[ngckEditor]"
})
export class EditorDirective implements OnInit, OnDestroy{
    @Input() editor!: Editor;

    private view!: EditorView;
    private _destroy = new Subject<void>();

    constructor(private el: ElementRef, private render: Renderer2, private command: CommandService, private domEditor: DocumentEditor) {}

    ngOnInit() {
        this._createView();
        this._listenerSetContent();
        this._registerCommands();
        this._registerChangeTip();
    }

    ngOnDestroy() {
        this._destroy.next();
        this._destroy.complete();
        this.view.destroy();
    }

    private _createView() {
        this.view = new EditorView(this.el.nativeElement, {
            state: this.editor.state,
            dispatchTransaction: (tr) => {
                if(!tr.docChanged || !tr.selection.$anchor.nodeBefore) {
                    this.domEditor.removeTipMark(tr);
                    this.editor.set("tips", () => []);
                }
                this.view.updateState(this.view.state.apply(tr));
                this._changePosition(tr);
                this._changeHtml(tr);
                this._changeText(tr);
            },
            handleClick: (view) => {
                this._changePosition(view.state.tr);
                this.editor.set("selectionParent", () => view.state.selection.$anchor.parent)
            },
            handleKeyDown: (view, event) => {
                if(event.key === "Escape") {
                    event.preventDefault();
                    const {tr} = view.state
                    this.domEditor.removeTipMark(tr);
                    view.updateState(view.state.apply(tr))
                    this.editor.set("tips", () => []);
                }

                if(this.editor.get().tips.length > 1 && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
                    event.preventDefault();
                    const offset = event.key === "ArrowDown" ? 1 : -1;
                    this.editor.set('tipIndex', (state) => {
                        const index = state.tipIndex + offset;
                        const max = Math.min(state.tips.length - 2, 4);
                        if(index < 0) {
                            return max;
                        }
                        if(index > max) {
                            return 0;
                        }
                        return index;
                    })
                }
            }
        });
        this.view.dom.classList.add("document-editor__editable", "ck", "ck-content", "ck-editor__editable", "ck-rounded-corners", "ck-editor__editable_inline")
        this.render.appendChild(this.el.nativeElement, this.view.dom);
    }

    private _listenerSetContent() {
        this.editor.select("replaceNode").pipe(
            takeUntil(this._destroy)
        ).subscribe(node => {
            const tr = this.view.state.tr;
            tr.replaceWith(0, this.view.state.doc.content.size, node)
            const newState = this.view.state.apply(tr);
            this.view.updateState(newState)
        })
    }

    private _registerCommands() {
        this.editor.select("execCommands").pipe(
            takeUntil(this._destroy)
        ).subscribe(commands => {
            commands.forEach(key => {
                this.command.exec(key)?.(this.view.state, (tr) => {
                    this.view.dispatch(tr);
                });
            })
        });
    }

    private _changeHtml(tr: Transaction) {
        const html = this.domEditor.toHTML(this.view);
        this.editor.set("value", () => html);
    }

    private _changeText(tr: Transaction) {
        if(!tr.docChanged || !tr.selection.$anchor.nodeBefore) {
            return ;
        }
        const start = tr.selection.empty ? 0 : tr.selection.from;
        const end = tr.selection.empty ? tr.selection.anchor : tr.selection.to;
        this.domEditor.removeTipMark(tr);
        const text = tr.doc.textBetween(start, Math.min(end, tr.doc.content.size));
        this.editor.set("valueTxt", () => text);
    }

    private _registerChangeTip() {
        this.editor.select(selectSlice(["tips", "tipIndex"])).pipe(
            takeUntil(this._destroy)
        ).subscribe(({tips, tipIndex}) => {
            const selection = this.view.state.selection;
            const tr = this.view.state.tr;
            this.domEditor.removeTipMark(tr);
            if(tips.length === 0) {
                return ;
            }
            let toPos = selection.$to.pos;
            if(toPos > tr.selection.to) {
                toPos = tr.selection.to
            }
            tr.insertText(tips[tipIndex], toPos);
            tr.addMark(toPos, toPos + tips[tipIndex].length, this.view.state.schema.mark("tip", null));
            tr.setSelection(TextSelection.create(tr.doc, toPos));
            const state = this.view.state.apply(tr);
            this.view.updateState(state);
        })
    }

    private _changePosition(tr: Transaction) {
        const selection = tr.selection;
        const start = this.view.coordsAtPos(selection.from);
        const end = this.view.coordsAtPos(selection.to);
        const position = {
            left: Math.min(start.left, end.left),
            top: Math.min(start.top, end.top),
            right: Math.max(start.right, end.right),
            bottom: Math.max(start.bottom, end.bottom)
        };
        this.editor.set("selectionPosition", () => position);
    }
}
