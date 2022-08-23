import {ChangeDetectionStrategy, Component, OnDestroy, OnInit} from "@angular/core";
import {EditorState, Editor, Config, ConfigState} from "../core";
import {DocumentEditor} from "./interfaces";

@Component({
    selector: "ngck-doc-editor",
    templateUrl: "./document-editor.component.html",
    styleUrls: ["./document-editor.component.less"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [{
        provide: Config, useClass: ConfigState
    }, {
        provide: Editor, useClass: EditorState
    }]
})
export class DocumentEditorComponent implements OnInit, OnDestroy{
    constructor(
        private editor: Editor,
        private docEditor: DocumentEditor
    ) {}

    ngOnInit() {
        this.docEditor.create()
    }

    ngOnDestroy() {
        this.editor.ngOnDestroy()
    }
}
