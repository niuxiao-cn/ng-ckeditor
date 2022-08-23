import {Directive, ElementRef, EventEmitter, HostListener, Output} from "@angular/core";

@Directive({
    selector: "[ngckForce]"
})
export class FocusDirective {
    @Output() ckFocus = new EventEmitter<boolean>()

    constructor(private el: ElementRef) { }

    @HostListener('focus') focus() {
        this.el.nativeElement.classList.remove("ck-blurred")
        this.el.nativeElement.classList.add("ck-focused")
        this.ckFocus.emit(true)
    }

    @HostListener("blur") blur() {
        this.el.nativeElement.classList.remove("ck-focused")
        this.el.nativeElement.classList.add("ck-blurred")
        this.ckFocus.emit(false)
    }
}
