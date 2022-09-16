import {ChangeDetectionStrategy, Component, Input} from "@angular/core";
import {RxState} from "@rx-angular/state";
import {distinctUntilChanged} from "rxjs";
import {CommandService, Editor} from "../../core";

@Component({
    selector: "ngck-heading",
    templateUrl: "./heading.component.html",
    styleUrls: ["./heading.component.less"],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [RxState]
})
export class HeadingComponent {
    @Input() set value(value: string) {
        this.state.set("value", () => value);
    }

    title$ = this.state.select("value").pipe(
        distinctUntilChanged()
    );

    visible = false

    constructor(
        private state: RxState<{value: string}>,
        private editor: Editor,
        private command: CommandService
    ) {
        this.state.set({value: ""});
    }

    handleChangeType(name: string, level?: number) {
        const key = this.command.getKey(name, level ? {level} : undefined)
        this.state.set("value", () => level ? `${name} ${level}` : "paragraph");
        this.editor.set("execCommands", () => [key]);
        this.visible = false;
    }
}
