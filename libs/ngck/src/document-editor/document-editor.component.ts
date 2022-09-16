import {
    ChangeDetectionStrategy,
    Component, ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnDestroy,
    OnInit,
    Output, ViewChild
} from "@angular/core";
import {Editor, EditorState} from "../core";
import {DocumentEditor} from "./interfaces";
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from "@angular/forms";
import {distinctUntilChanged, map, Subject, takeUntil} from "rxjs";

@Component({
    selector: "ngck-doc-editor",
    templateUrl: "./document-editor.component.html",
    styleUrls: ["./document-editor.component.less"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{provide: Editor, useClass: EditorState}, {
        provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DocumentEditorComponent), multi: true
    }]
})
export class DocumentEditorComponent implements OnInit, OnDestroy, ControlValueAccessor{
    private _onChange?: (value: string) => void;
    private _onTouch?: () => void;
    private _cancelValue = new Subject<void>();

    @Input() set tips(tips: string[]) {
        this.editor.set("tips", () => tips);
        this.editor.set("tipIndex", () => 0);
    }

    @Output() textChange = new EventEmitter<string>();

    @ViewChild("tipContent") tipContent?: ElementRef

    tipLeft$ = this.editor.select("selectionPosition").pipe(
        map(({left, right}) => left + (right - left) / 2  - 202 + "px"),
        distinctUntilChanged()
    )

    tipTop$ = this.editor.select("selectionPosition").pipe(
        map(({bottom}) => bottom + "px"),
        distinctUntilChanged()
    )

    tips$ = this.editor.select("tips").pipe(
        map(tips => tips.slice(0, 5))
    )

    tipIndex$ = this.editor.select("tipIndex");

    parentType$ = this.editor.select("selectionParent").pipe(
        map(node => {
            if(node.type.name === "heading") {
                return node.type.name + " " + node.attrs['level']
            }
            if(node.type.name !== "paragraph") {
                return "";
            }
            return "paragraph"
        }),
        distinctUntilChanged()
    );

    constructor(
        public editor: Editor,
        private docEditor: DocumentEditor
    ) {}

    ngOnInit() {
        this.editor.select("value").pipe(
            distinctUntilChanged(),
            takeUntil(this._cancelValue)
        ).subscribe(value => {
            this._onChange?.(value)
        });

        this.editor.select("valueTxt").pipe(
            distinctUntilChanged(),
            takeUntil(this._cancelValue)
        ).subscribe(txt => {
            this.textChange.emit(txt);
        });

        this.tipIndex$.pipe(
            distinctUntilChanged(),
            takeUntil(this._cancelValue)
        ).subscribe((tipIndex) => {
            if(!this.tipContent) {
                return ;
            }
            const items = this.tipContent.nativeElement.querySelectorAll(".tip-item")
            if(!items) {
                return ;
            }
            items.forEach((item: HTMLElement, index: number) => {
                if(index === tipIndex) {
                    this.tipContent?.nativeElement.scrollTo(0, item.offsetTop);
                }
            })
        })
    }

    ngOnDestroy() {
        this.editor.ngOnDestroy();
        this._cancelValue.next();
        this._cancelValue.complete();
    }

    registerOnChange(fn: (value: string) => void): void {
        if(!this._onChange) {
            this._onChange = fn;
        }
    }

    registerOnTouched(fn: () => void): void {
        this._onTouch = fn;
    }

    writeValue(value: string): void {
        this.editor.set({value: value || ""});
        this.editor.set("replaceNode", () => {
            return this.docEditor.parseContent(value, this.editor.state.schema);
        })
    }
}
