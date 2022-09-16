import {NgModule} from "@angular/core";
import {Tools} from "./api/tools";
import {ToolsService} from "./tools.service";
import {DataProcessorService} from "./data-processor.service";
import {DomFiltersService} from "./dom-filters.service";
import {ConverterService} from "./converter";

@NgModule({
    providers: [{
        provide: Tools, useClass: ToolsService
    }, DataProcessorService, DomFiltersService, ConverterService]
})
export class EngineModule {}
