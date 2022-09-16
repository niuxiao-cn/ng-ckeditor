import {RxState} from "@rx-angular/state";
import {Command, EditorState, Plugin} from "prosemirror-state";
import {Node} from "prosemirror-model"
import {InjectionToken} from "@angular/core";

export const PLUGIN = new InjectionToken<Plugin>("EditorPlugins");

export type CommandQuery = URLSearchParams;

export interface CommandItem {
    name: string,
    command(query?: CommandQuery): Command
}

export const COMMAND = new InjectionToken<CommandItem>('Command Item');

export abstract class Editor extends RxState<{
    replaceNode: Node,
    value: string,
    selectionParent: Node,
    execCommands: string[],
    valueTxt: string,
    tips: string[],
    selectionPosition: {left: number, top: number, right: number, bottom: number},
    tipIndex: number
}>{
    abstract state: EditorState
}

export interface CommandManage {
    exec(name: string, query?: CommandQuery): Command | undefined
    getKey(name: string, query: Record<string, string | number>): string
    parseKey(key: string): {name: string, query: CommandQuery}
}
