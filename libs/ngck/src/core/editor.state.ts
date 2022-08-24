import {Injectable} from "@angular/core";
import {Config, Editor} from "./interfaces";
import {StyleTools} from "../engine";

@Injectable()
export class EditorState extends Editor{
    private stylesProcessor = this.styleTools.getStylesProcessor()

    constructor(private config: Config, private styleTools: StyleTools) {
        super();
        console.log(this.stylesProcessor)
    }
}
