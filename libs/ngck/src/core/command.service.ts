import {Inject, Injectable} from "@angular/core";
import {COMMAND, CommandItem, CommandManage, CommandQuery} from "./interfaces";
import {Command} from "prosemirror-state";

@Injectable()
export class CommandService implements CommandManage{
    private _commands: Map<string, CommandItem>
    private BASE = window.location.protocol + "//" + window.location.hostname;

    constructor(@Inject(COMMAND) private commands: CommandItem[]) {
        this._commands = new Map(commands.map(item => [item.name, item]))
    }

    exec(key: string): Command | undefined {
        const {name, query} = this.parseKey(key);
        return this._commands.get(name)?.command(query);
    }

    getKey(name: string, query: Record<string, string | number> = {}): string {
        const url = new URL(name, this.BASE);
        for(const key of Object.keys(query)) {
            url.searchParams.set(key, query[key].toString());
        }
        return url.toString();
    }

    parseKey(key: string): {name: string, query: CommandQuery} {
        const url = new URL(key, this.BASE);
        return {name: url.pathname.replace(/^\//, ""), query: url.searchParams};
    }
}
