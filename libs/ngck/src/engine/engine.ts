import {Injectable} from "@angular/core";
import {Processor} from "./api/processor";
import {HtmlDataProcessor, StylesProcessor, ViewDocument} from "@ckeditor/ckeditor5-engine";
import UpcastDispatcher from "@ckeditor/ckeditor5-engine/src/conversion/upcastdispatcher";
import {SchemaContextDefinition} from "@ckeditor/ckeditor5-engine/src/model/schema";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";

@Injectable()
export class Engine implements Processor {
    style = new StylesProcessor();
    processor = new HtmlDataProcessor(new ViewDocument(this.style));
    upcastDispatcher = new UpcastDispatcher()

    toView(data: string): ReturnType<HtmlDataProcessor["toView"]> {
        return this.processor.toView(data);
    }

    toModel(view: ReturnType<HtmlDataProcessor["toView"]>, writer: Writer, context: SchemaContextDefinition = "$root"): ReturnType<UpcastDispatcher["convert"]> {
        return this.upcastDispatcher.convert(view, writer, context);
    }
}
