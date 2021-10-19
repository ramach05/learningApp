import { postsController, TApiItem } from "../controllers/post.controller";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import * as RD from "@devexperts/remote-data-ts";
import { AjaxError } from "rxjs/ajax";

const getPostsData = postsController.getPosts;
const postOneTitle = postsController.postItem;

export type TPostResponseShortData = Pick<TApiItem, "title" | "body" | "id">;

// export type TPostsResponseShortData = {
//     title: string;
//     body: string;
// }

export type TPostsViewModel = {
  getPostsData$: Observable<RD.RemoteData<AjaxError, TPostResponseShortData[]>>;
  postOneTitle$: Observable<RD.RemoteData<AjaxError, TPostResponseShortData[]>>;
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

  const postOneTitle$ = postOneTitle().pipe(
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

  return {
    getPostsData$,
    postOneTitle$,
  };
};
