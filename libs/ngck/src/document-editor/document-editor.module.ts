import {NgModule} from "@angular/core";
import {DocumentEditorComponent} from "./document-editor.component";
import {UtilsModule} from "../utils";
import {DocumentEditor} from "./interfaces";
import {DocumentEditorService} from "./document-editor.service";

@NgModule({
    declarations: [DocumentEditorComponent],
    exports: [DocumentEditorComponent],
    imports: [UtilsModule],
    providers: [{
        provide: DocumentEditor, useClass: DocumentEditorService
    }]
})
export class DocumentEditorModule {}
