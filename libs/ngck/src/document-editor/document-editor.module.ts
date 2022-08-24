import {NgModule} from "@angular/core";
import {DocumentEditorComponent} from "./document-editor.component";
import {UtilsModule} from "../utils";
import {DocumentEditor} from "./interfaces";
import {DocumentEditorService} from "./document-editor.service";
import {EngineModule} from "../engine";

@NgModule({
    declarations: [DocumentEditorComponent],
    exports: [DocumentEditorComponent],
    imports: [UtilsModule, EngineModule],
    providers: [{
        provide: DocumentEditor, useClass: DocumentEditorService
    }]
})
export class DocumentEditorModule {}
