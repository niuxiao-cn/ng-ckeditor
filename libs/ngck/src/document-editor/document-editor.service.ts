import {Injectable} from "@angular/core";
import {DocumentEditor} from "./interfaces";

@Injectable()
export class DocumentEditorService implements DocumentEditor {
    create() {
        console.log("create")
    }
}
