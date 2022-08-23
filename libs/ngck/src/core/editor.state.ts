import {Injectable} from "@angular/core";
import {Config, Editor} from "./interfaces";

@Injectable()
export class EditorState extends Editor{
    constructor(private config: Config) {
        super();
    }
}
