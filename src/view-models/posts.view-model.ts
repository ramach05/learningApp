import {
  postsController,
  TApiGetResponse,
  TApiItem,
} from "../controllers/post.controller";
import { map, tap } from "rxjs/operators";
import { switchMap } from 'rxjs/internal/operators';
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import * as RD from "@devexperts/remote-data-ts";
import { AjaxError } from "rxjs/ajax";

const getPostsData = postsController.getPosts;
const postOneItem = postsController.postItem;

export type TPostResponseShortData = Pick<TApiItem, "title" | "body" | "id">;

export type TPostsViewModel = {
  // getPostsData$: Observable<RD.RemoteData<AjaxError, TPostResponseShortData[]>>;
  postOneItem$: Observable<(req: TRequest) => void>;
  postOneItemStream$: Observable<RD.RemoteData<AjaxError, TApiGetResponse>>;
    getPostDataStream$: Observable<RD.RemoteData<AjaxError, TPostResponseShortData[]>>;
};

export type TRequest = {
    title: string;
    body: string;
}
export const postsViewModel = (): TPostsViewModel => {

    const getPostDataTrigger$ = new BehaviorSubject(true);
    const getPostDataStream$ = getPostDataTrigger$.pipe(
        switchMap(() => getPostsData())
    );

  const postOneItem$ = of((request: TRequest) => postOneItemTrigger$.next(request));

  const postOneItemTrigger$ = new Subject<TRequest>();

  const postOneItemStream$ = postOneItemTrigger$.pipe(
      switchMap((req) => postOneItem(req.title, req.body).pipe(
          tap(() => getPostDataTrigger$.next(true))
      ))
  );



  return {
    postOneItem$,
    postOneItemStream$,
    getPostDataStream$
  };
};
