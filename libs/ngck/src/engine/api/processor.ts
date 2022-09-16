import {RootElementImpl} from "./model";
import {ChildrenImpl, ChildrenOffsetImpl, NodeImpl, NodeItem, TextItem} from "./node";
import {HtmlDataProcessor, StylesProcessor} from "@ckeditor/ckeditor5-engine";
import Writer from "@ckeditor/ckeditor5-engine/src/model/writer";
import {SchemaContextDefinition} from "@ckeditor/ckeditor5-engine/src/model/schema";
import UpcastDispatcher from "@ckeditor/ckeditor5-engine/src/conversion/upcastdispatcher";

export interface DataProcessor {
    toModel(data: string, root: RootElementImpl): NodeItem | (NodeItem & ChildrenImpl & ChildrenOffsetImpl) | (ChildrenImpl & NodeImpl & ChildrenOffsetImpl) | TextItem | null
}

export interface  Processor {
    style: StylesProcessor
    processor: HtmlDataProcessor
    upcastDispatcher: UpcastDispatcher

    toView(data: string): ReturnType<HtmlDataProcessor["toView"]>
    toModel(view: ReturnType<HtmlDataProcessor["toView"]>, writer: Writer, context?: SchemaContextDefinition): ReturnType<UpcastDispatcher["convert"]>
}
