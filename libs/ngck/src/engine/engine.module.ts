import {NgModule} from "@angular/core";
import {DocTools, MatchTools, StyleTools} from "./interfaces";
import {StyleToolsService} from "./style-tools.service";
import {DocToolsService} from "./doc-tools.service";
import {MatchToolsService} from "./match-tools.service";

@NgModule({
    providers: [{
        provide: StyleTools, useClass: StyleToolsService
    }, {
        provide: MatchTools, useClass: MatchToolsService
    }, {
        provide: DocTools, useClass: DocToolsService
    }]
})
export class EngineModule {}
