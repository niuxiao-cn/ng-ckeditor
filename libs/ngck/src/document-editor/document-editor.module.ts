import {NgModule} from "@angular/core";
import {DocumentEditorComponent} from "./document-editor.component";
import {DocumentEditor} from "./interfaces";
import {DocumentEditorService} from "./document-editor.service";
import {EditorDirective} from "./editor.directive";
import {CoreModule} from "../core";
import {CommonModule} from "@angular/common";
import {HeadingComponent} from "./heading/heading.component";
import {UIModule} from "../ui";

@NgModule({
    declarations: [
        DocumentEditorComponent,
        EditorDirective,
        HeadingComponent
    ],
    exports: [DocumentEditorComponent],
    imports: [CoreModule, CommonModule, UIModule],
    providers: [{
        provide: DocumentEditor, useClass: DocumentEditorService
    }]
})
export class DocumentEditorModule {}
