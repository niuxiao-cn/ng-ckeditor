import {Injectable} from "@angular/core";
import {DataProcessor, Processor} from "./api/processor";
import {RootElementImpl} from "./api/model";
import {ConverterService} from "./converter";
import {ChildrenImpl, ChildrenOffsetImpl, NodeImpl, NodeItem, TextItem} from "./api/node";

@Injectable()
export class DataProcessorService implements DataProcessor {
    private domParser = new DOMParser()

    constructor(private converter: ConverterService) { }

    toModel(data: string, root: RootElementImpl):  NodeItem | (NodeItem & ChildrenImpl & ChildrenOffsetImpl) | (ChildrenImpl & NodeImpl & ChildrenOffsetImpl) | TextItem | null {
        // const fragment = root.engine.toView(data)
        // console.log(fragment);
        // const modelRoot = root.model.document.getRoot("main")
        // const model = root.model.change(writer => {
        //     if(modelRoot) {
        //         return root.engine.toModel(fragment, writer, modelRoot)
        //     }
        //     return null
        // })
        //
        // console.log(model, root.model)
        return this.converter.toModel(this._toDom(data), root)
    }


    private _toDom(data: string): DocumentFragment {
        if ( !data.match( /<(?:html|body|head|meta)(?:\s[^>]*)?>/i ) ) {
            data = `<body>${ data }</body>`;
        }
        const document = this.domParser.parseFromString( data, 'text/html' );
        const fragment = document.createDocumentFragment();
        const bodyChildNodes = document.body.childNodes;

        while ( bodyChildNodes.length > 0 ) {
            fragment.appendChild( bodyChildNodes[ 0 ] );
        }

        return fragment;
    }
}
