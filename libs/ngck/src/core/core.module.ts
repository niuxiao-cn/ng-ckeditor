import {NgModule} from "@angular/core";
import {COMMAND, PLUGIN} from "./interfaces";
import {history, redo, undo} from "prosemirror-history";
import {baseKeymap} from "prosemirror-commands";
import {keymap} from "prosemirror-keymap";
import {focusPlugin} from "./plugins";
import {HeadingCommand} from "./commands/heading.command";
import {CommandService} from "./command.service";
import {UseTipCommand} from "./commands/use-tip.command";

@NgModule({
    providers: [{
        provide: PLUGIN, useValue: history(), multi: true
    }, {
        provide: PLUGIN, useValue: keymap(baseKeymap), multi: true
    }, {
        provide: PLUGIN, useFactory: (command: CommandService) => keymap({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            "Mod-z": undo, "Mod-y": redo, "Tab": command.exec(command.getKey("use_tip"))!
        }), deps: [CommandService], multi: true
    }, {
        provide: PLUGIN, useValue: focusPlugin(), multi: true
    }, {
        provide: COMMAND, useClass: HeadingCommand, multi: true
    }, {
        provide: COMMAND, useClass: UseTipCommand, multi: true
    },CommandService]
})
export class CoreModule {}
