import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    Output,
    TemplateRef
} from "@angular/core";
import {RxState} from "@rx-angular/state";

@Component({
    selector: "ngck-dropdown",
    templateUrl: "./dropdown.component.html",
    styleUrls: ["./drop.component.less"],
    providers: [RxState],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DropdownComponent {

    @Input() set visible(visible: boolean) {
        this.state.set("visible", () => visible);
    }

    @Output() visibleChange = new EventEmitter<boolean>();

    @Input() content: TemplateRef<unknown> | null = null;

    visible$ = this.state.select("visible");

    @HostListener("document:mousedown", ["$event.target"])
    onDocumentClick(target: Node) {
        if(!this.el.nativeElement.contains(target) && this.state.get().visible) {
            this.visibleChange.emit(false);
            this.state.set("visible", () => false);
        }
    }

    constructor(private state: RxState<{
        visible: boolean
    }>, private el: ElementRef) {
        this.state.set({visible: false});
    }


    handleToggle(event: MouseEvent) {
        event.preventDefault()
        this.state.set("visible", (state) => {
            this.visibleChange.emit(!state.visible);
            return !state.visible;
        })
    }
}
