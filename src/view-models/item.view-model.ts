import {
  postsController,
  TApiGetResponse,
  TApiItem,
} from "../controllers/item.controller";
import { tap } from "rxjs/operators";
import { switchMap } from "rxjs/internal/operators";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import * as RD from "@devexperts/remote-data-ts";
import { AjaxError } from "rxjs/ajax";

const getPostsData = postsController.getPosts;
const postOneItem = postsController.postItem;
const deleteOneItem = postsController.deleteItem;

export type TPostResponseShortData = Pick<TApiItem, "title" | "body" | "id">;

export type TPostsViewModel = {
  getPostDataStream$: Observable<
    RD.RemoteData<AjaxError, TPostResponseShortData[]>
  >;

  postOneItem$: Observable<(req: TRequest) => void>;
  postOneItemStream$: Observable<RD.RemoteData<AjaxError, TApiGetResponse>>;

  deleteOneItem$: Observable<(id: number) => void>;
  deleteOneItemStream$: Observable<RD.RemoteData<AjaxError, TApiGetResponse>>;
};

export type TRequest = {
  title: string;
  body: string;
};

export const postsViewModel = (): TPostsViewModel => {
  // ?--------------------------------------

  const getPostDataTrigger$ = new BehaviorSubject(true);
  const getPostDataStream$ = getPostDataTrigger$.pipe(
    switchMap(() => getPostsData())
  );

  const postOneItem$ = of((request: TRequest) =>
    postOneItemTrigger$.next(request)
  );
  const postOneItemTrigger$ = new Subject<TRequest>();
  const postOneItemStream$ = postOneItemTrigger$.pipe(
    // switchMap((req: TRequest) =>
    //   postOneItem(req.title, req.body).pipe(
    //     tap((data) => dataStream$.next(data))
    //   )
    // )
    switchMap((req) =>
      postOneItem(req.title, req.body).pipe(
        tap(() => getPostDataTrigger$.next(true))
      )
    )
  );

  const deleteOneItem$ = of((id: number) => deleteOneItemTrigger$.next(id));
  const deleteOneItemTrigger$ = new BehaviorSubject(0);
  const deleteOneItemStream$ = deleteOneItemTrigger$.pipe(
    switchMap((id) => deleteOneItem(id))
  );

  return {
    getPostDataStream$,

    postOneItem$,
    postOneItemStream$,

    deleteOneItem$,
    deleteOneItemStream$,
  };
};
