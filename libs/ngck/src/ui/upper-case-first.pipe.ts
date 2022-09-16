import {Pipe, PipeTransform} from "@angular/core";

@Pipe({
    name: "ngckUpperCaseFirst"
})
export class UpperCaseFirstPipe implements PipeTransform {
    transform(value: string): string {
        value.match(/^[a-z]{1}/g)?.forEach((c) => {
            value = value.replace(c, c.toUpperCase());
        })
        return value;
    }
}
