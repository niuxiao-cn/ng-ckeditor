import {Injectable} from "@angular/core";
import {Observable} from "rxjs";

@Injectable({providedIn: "root"})
export class TipService {
    private worker = new Worker(new URL("./tip.worker", import.meta.url));

    getTip(prefix: string): Observable<string[]> {
        return new Observable<string[]>(subscriber => {
            this.worker.onmessage = ({data}: {data: {list: string[]}}) => {
                subscriber.next(data.list);
                subscriber.complete();
            }
            this.worker.postMessage(prefix);
        });
    }
}
