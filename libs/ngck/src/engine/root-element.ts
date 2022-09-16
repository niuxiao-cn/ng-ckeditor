import {Element} from "./element"
import {RootImpl} from "./api/node";
import {Tools} from "./api/tools";

export class RootElement extends Element implements RootImpl{
    override type = new Set(["rootElement", "model:rootElement"])

    constructor(tools: Tools, name: string, public rootName = "main") {
        super(tools, name);
    }
}
