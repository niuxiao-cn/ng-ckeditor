import {RxState} from "@rx-angular/state";

export abstract class View extends RxState<{
    element: HTMLElement | null
    isRendered: boolean,
    isFocused: boolean
}> {}
