import { ajax, AjaxError, AjaxRequest } from "rxjs/ajax";
import { Observable, Subject } from "rxjs";
import * as RD from "@devexperts/remote-data-ts";
import { catchError, map, startWith } from "rxjs/operators";
import { of } from "rxjs";

export enum RequestMethod {
  GET = "GET",
  POST = "POST",
  DELETE = "DELETE",
  PUT = "PUT",
}

class ApiClient {
  private readonly errorSubj$ = new Subject<AjaxError>();

  readonly RequestMethod = RequestMethod;

  readonly request = <Response>(
    request: AjaxRequest
  ): Observable<RD.RemoteData<AjaxError, Response>> => {
    const xhr: AjaxRequest = {
      ...request,
      body: request.body && JSON.stringify(request.body),
    };

    return ajax(xhr).pipe(
      map((response) => RD.success(response.response)),
      catchError((response: AjaxError) => {
        this.errorSubj$.next(response);
        return of(RD.failure(response));
      }),
      startWith(RD.pending)
    );
  };

  readonly get = <Response>(
    url: string
  ): Observable<RD.RemoteData<AjaxError, Response>> => {
    return this.request({
      url,
      method: this.RequestMethod.GET,
    });
  };

  readonly post = <Response>(
    url: string,
    body: { title: string; body: string; userId: number }
  ): Observable<RD.RemoteData<AjaxError, Response>> => {
    return this.request({
      url,
      body,
      method: this.RequestMethod.POST,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
  };

  readonly delete = <Response>(
    url: string
  ): Observable<RD.RemoteData<AjaxError, Response>> => {
    return this.request({
      url,
      method: this.RequestMethod.DELETE,
    });
  };

  readonly put = <Response>(
    url: string,
    body: { id: number; title: string; body: string; userId: number }
  ): Observable<RD.RemoteData<AjaxError, Response>> => {
    return this.request({
      url,
      body,
      method: this.RequestMethod.PUT,
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    });
  };
}

export const Api = new ApiClient();
