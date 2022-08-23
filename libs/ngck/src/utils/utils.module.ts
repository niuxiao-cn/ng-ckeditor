import {NgModule} from "@angular/core";
import {Utils} from "./interfaces";
import {UtilsService} from "./utils.service";
import {FocusDirective} from "./focus.directive";

@NgModule({
    declarations: [FocusDirective],
    exports: [FocusDirective],
    providers: [{
        provide: Utils, useClass: UtilsService
    }]
})
export class UtilsModule {}
