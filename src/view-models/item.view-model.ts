import {
  itemsController,
  TApiGetResponse,
  TApiItem,
} from "../controllers/item.controller";
import { skip, tap } from "rxjs/operators";
import { switchMap } from "rxjs/internal/operators";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import * as RD from "@devexperts/remote-data-ts";
import { AjaxError } from "rxjs/ajax";

const getItemsData = itemsController.getItems;
const postOneItem = itemsController.postItem;
const deleteOneItem = itemsController.deleteItem;
const putOneItem = itemsController.putItem;

export type TGetResponseShortData = TApiItem;
export type TPostResponseShortData = Pick<TApiItem, "title" | "body">;
export type TDeleteResponseShortData = Pick<TApiItem, "id">;
export type TPutResponseShortData = TApiItem;

export type TItemsViewModel = {
  getItemsDataStream$: Observable<
    RD.RemoteData<AjaxError, TGetResponseShortData[]>
  >;

  postOneItem$: Observable<(req: TPostResponseShortData) => void>;
  postOneItemStream$: Observable<RD.RemoteData<AjaxError, TApiGetResponse>>;

  deleteOneItem$: Observable<(req: TDeleteResponseShortData) => void>;
  deleteOneItemStream$: Observable<RD.RemoteData<AjaxError, TApiGetResponse>>;

  putOneItem$: Observable<(req: TPutResponseShortData) => void>;
  putOneItemStream$: Observable<RD.RemoteData<AjaxError, TApiGetResponse>>;
};

export const itemsViewModel = (): TItemsViewModel => {
  const getItemsDataTrigger$ = new BehaviorSubject(true);
  const getItemsDataStream$ = getItemsDataTrigger$.pipe(
    switchMap(() => getItemsData())
  );

  const postOneItem$ = of((request: TPostResponseShortData) =>
    postOneItemTrigger$.next(request)
  );
  const postOneItemTrigger$ = new Subject<TPostResponseShortData>();
  const postOneItemStream$ = postOneItemTrigger$.pipe(
    switchMap((req) =>
      postOneItem(req.title, req.body)
        .pipe
        // skip(1),
        // tap(() => getItemsDataTrigger$.next(true))
        ()
    )
  );

  const deleteOneItem$ = of((id: TDeleteResponseShortData) =>
    deleteOneItemTrigger$.next(id)
  );
  const deleteOneItemTrigger$ = new Subject<TDeleteResponseShortData>();
  const deleteOneItemStream$ = deleteOneItemTrigger$.pipe(
    switchMap(({ id }) => deleteOneItem(id))
  );

  const putOneItem$ = of((request: TPutResponseShortData) =>
    putOneItemTrigger$.next(request)
  );
  const putOneItemTrigger$ = new Subject<TPutResponseShortData>();
  const putOneItemStream$ = putOneItemTrigger$.pipe(
    switchMap((req) => putOneItem(req.id, req.title, req.body, req.userId))
  );

  return {
    getItemsDataStream$,

    postOneItem$,
    postOneItemStream$,

    deleteOneItem$,
    deleteOneItemStream$,

    putOneItem$,
    putOneItemStream$,
  };
};
