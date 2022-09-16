import {Component, OnDestroy} from '@angular/core';
import {TipService} from "./tip.service";
import {Subject, takeUntil} from "rxjs";

@Component({
    selector: 'ng-editor-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.less'],
})
export class AppComponent implements OnDestroy{
    value = "";
    tips: string[] = [];

    private _cancel = new Subject<void>();

    constructor(private tipService: TipService) {}


    handleChangeText(text: string) {
        this._cancel.next();
        this._cancel.complete();
        this.tipService.getTip(text).pipe(
            takeUntil(this._cancel)
        ).subscribe(tips => {
            const reg = new RegExp("^" + text);
            this.tips = tips.map(item => item.replace(reg, ""));
        });
    }

    ngOnDestroy() {
        this._cancel.next();
        this._cancel.complete();
    }
}
