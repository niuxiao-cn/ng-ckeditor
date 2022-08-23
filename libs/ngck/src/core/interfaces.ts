import {RxState} from "@rx-angular/state";

export type EditorConfig = {
    wordCount?: WordCount | undefined
}

export type WordCount = {
    container: HTMLElement
    displayCharacters?: boolean | undefined
    displayWords?: boolean | undefined
}

export abstract class Config extends RxState<Record<string, unknown>> {
    abstract setConfig( name: string, value: unknown ): void
    abstract setConfig( config: Record<string, unknown> ): void
    abstract setConfig(name: string | Record<string, unknown>, value?: unknown): void

    abstract define(name: string, value: unknown): void
    abstract define(config: Record<string, unknown>): void
    abstract define(name: string | Record<string, unknown>, value?: unknown): void

    abstract getConfig(name: string): unknown

    abstract names(): Iterable<string>
}

export abstract class Editor extends RxState<{ state: string }>{
}

export abstract class EditorUI extends RxState<{
    rootName: string,
    viewportOffset: {
        top: number, right: number, bottom: number, left: number
    },
    editing: {
        view: unknown
    }
}> {}
