import {
  postsController,
  TApiGetResponse,
  TApiItem,
} from "../controllers/post.controller";
import { map, switchMap, tap } from "rxjs/operators";
import { Observable, of, Subject } from "rxjs";
import * as RD from "@devexperts/remote-data-ts";
import { AjaxError } from "rxjs/ajax";
import { link } from "fs";

const getPostsData = postsController.getPosts;
const postOneItem = postsController.postItem;

export type TPostResponseShortData = Pick<TApiItem, "title" | "body" | "id">;

export type TPostsViewModel = {
  getPostsData$: Observable<RD.RemoteData<AjaxError, TPostResponseShortData[]>>;
  postOneItem$: Observable<() => void>;
  postOneItemStream$: Observable<RD.RemoteData<AjaxError, TApiGetResponse>>;
};

export const postsViewModel = (
  title: string,
  body: string
): TPostsViewModel => {
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

  const postOneItem$ = of(() => postOneItemTrigger$.next());

  const postOneItemTrigger$ = new Subject();

  const postOneItemStream$ = postOneItemTrigger$.pipe(
    switchMap(() =>
      postOneItem(title, body).pipe(tap((data) => dataStream$.next(data)))
    )
  );

  return {
    getPostsData$,
    postOneItem$,
    postOneItemStream$,
  };
};
