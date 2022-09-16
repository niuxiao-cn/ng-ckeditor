import {NgModule} from "@angular/core";
import {DropdownComponent} from "./dropdown/dropdown.component";
import {UpperCaseFirstPipe} from "./upper-case-first.pipe";
import {CommonModule} from "@angular/common";

@NgModule({
    declarations: [DropdownComponent, UpperCaseFirstPipe],
    exports: [DropdownComponent, UpperCaseFirstPipe],
    imports: [CommonModule]
})
export class UIModule {}
