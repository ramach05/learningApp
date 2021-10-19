import {
  postsController,
  TApiGetResponse,
  TApiItem,
} from "../controllers/post.controller";
import { map, tap } from "rxjs/operators";
import { switchMap } from "rxjs/internal/operators";
import { Observable, of, Subject } from "rxjs";
import * as RD from "@devexperts/remote-data-ts";
import { AjaxError } from "rxjs/ajax";

const getPostsData = postsController.getPosts;
const postOneItem = postsController.postItem;

export type TPostResponseShortData = Pick<TApiItem, "title" | "body" | "id">;

export type TPostsViewModel = {
  getPostsData$: Observable<RD.RemoteData<AjaxError, TPostResponseShortData[]>>;
  postOneItem$: Observable<(req: TRequest) => void>;
  postOneItemStream$: Observable<RD.RemoteData<AjaxError, TApiGetResponse>>;
};

export type TRequest = {
  title: string;
  body: string;
};

export const postsViewModel = (): TPostsViewModel => {
  // Simulation of business logic, just shortening the data
  const getPostsData$ = getPostsData().pipe(
    map(
      RD.map((items) =>
        items.map((item) => ({
          title: item.title,
          body: item.body,
          id: item.id,
        }))
      )
    )
  );

  const dataStream$ = new Subject();

  const postOneItem$ = of((request: TRequest) =>
    postOneItemTrigger$.next(request)
  );

  const postOneItemTrigger$ = new Subject();

  const postOneItemStream$ = postOneItemTrigger$.pipe(
    //@ts-ignore
    switchMap((req: TRequest) =>
      postOneItem(req.title, req.body).pipe(
        tap((data) => dataStream$.next(data))
      )
    )
  );

  return {
    getPostsData$,
    postOneItem$,
    postOneItemStream$,
  };
};
