import * as Rx from "rxjs";
import { WebSocketSubject } from "rxjs/observable/dom/WebSocketSubject";
import { BehaviorSubject } from "rxjs/BehaviorSubject";

export interface File {
    path: string;
    data: any;
}

export interface IFileServerService {
    getConnectionStatus$(): Rx.Observable<boolean>;
    getFile(path: string, requestsCount: number): Rx.Observable<File>;
}

interface Response {
    request: any;
    response: any;
}

export class WebSocketFileServerService implements IFileServerService {
    private status$: Rx.Subject<boolean> = new Rx.Subject<boolean>();
    private outgoing$: Rx.Subject<string> = new Rx.Subject<string>();
    private incoming$: Rx.Subject<Response> = new Rx.Subject<Response>();

    constructor(private address$: Rx.Observable<string>) {
        address$
            .filter(address => address !== "")
            .switchMap(address => this.connectWebSocket(address))
            .map(msg => msg as Response)
            .subscribe(this.incoming$);
    }

    public getFile(path: string, requestCount: number): Rx.Observable<File> {
        console.log(`Loading file with path: ${path}`);
        return this.send(path, requestCount).map(data => {
            return { path, data };
        });
    }

    public getConnectionStatus$(): Rx.Observable<boolean> {
        return this.status$;
    }

    private send(request: string, requestCount: number): Rx.Observable<string> {
        return Rx.Observable.create((observer: Rx.Observer<string>) => {
            console.log(`sending outgoing request ${request}`);
            const responseSub = this.incoming$
                .filter(r => r.request === request)
                .skip(requestCount - 1)
                .take(1)
                .map(r => r.response)
                .subscribe(observer);
            for (let i = 0; i < requestCount; i++) {
                this.outgoing$.next(request);
            }
            return responseSub;
        });
    }

    private connectWebSocket(address: string): Rx.Observable<any> {
        console.log(`Connecting websocket to ${address}`);
        const openSubject = new Rx.Subject<Event>();
        openSubject.map(_ => true).subscribe(this.status$);
        const closeSubject = new Rx.Subject<CloseEvent>();
        closeSubject.map(_ => false).subscribe(this.status$);
        const ws = Rx.Observable.webSocket<any>({ 
            url: address, 
            openObserver: openSubject, 
            closeObserver: closeSubject });
        
        return Rx.Observable.using(
            () => this.outgoing$.subscribe(ws), 
            () => ws.retryWhen((errs) => errs.switchMap(() => {
                this.status$.next(false);
                console.log("retrying connection");
                return Rx.Observable.timer(1000);
            }).repeat()));
    }
}