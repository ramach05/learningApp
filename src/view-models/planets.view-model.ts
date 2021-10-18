import { postsController, TApiItem } from "../controllers/post.controller";
import { map } from "rxjs/operators";
import { Observable } from "rxjs";
import * as RD from "@devexperts/remote-data-ts";
import { AjaxError } from "rxjs/ajax";

const getPostsData = postsController.getPosts; //?-------

export type TPostsShortData = Pick<TApiItem, "title" | "body" | "id">;

// export type TPostsShortData = {
//     title: string;
//     body: string;
// }

export type TPostsViewModel = {
    getPostsData$: Observable<RD.RemoteData<AjaxError, TPostsShortData[]>>; //?-------
};

export const postsViewModel = (): TPostsViewModel => {
    // Simulation of business logic, just shortening the data
    const getPostsData$ = getPostsData().pipe(
        //?-------
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
    };
};
