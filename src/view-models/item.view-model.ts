import {
  itemsController,
  TAction,
  TApiGetResponse,
  TApiItem,
} from "../controllers/item.controller";
import { scan, tap } from "rxjs/operators";
import { switchMap } from "rxjs/internal/operators";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import * as RD from "@devexperts/remote-data-ts";
import { AjaxError } from "rxjs/ajax";
import { isSuccess } from "@devexperts/remote-data-ts";
import { pipe } from "fp-ts/lib/function";
import { sequenceT } from "fp-ts/lib/Apply";

const getItemsData = itemsController.getItems;
const postOneItem = itemsController.postItem;
const deleteOneItem = itemsController.deleteItem;
const putOneItem = itemsController.putItem;

export type TGetResponseShortData = TApiItem;
export type TPostResponseShortData = Pick<TApiItem, "title" | "body">;
export type TDeleteResponseShortData = Pick<TApiItem, "id">;
export type TPutResponseShortData = TApiItem;

export type TItemsViewModel = {
  allItemsDataStream$: Observable<
    RD.RemoteData<AjaxError, TGetResponseShortData[]>[]
  >;

  getItemsDataStream$: Observable<
    RD.RemoteData<AjaxError, TGetResponseShortData[]>
  >;

  postOneItem$: Observable<(req: TPostResponseShortData) => void>;
  postOneItemStream$: Observable<RD.RemoteData<AjaxError, TApiItem>>;

  deleteOneItem$: Observable<
    (id: TDeleteResponseShortData, item: TApiItem) => void
  >;
  deleteOneItemStream$: Observable<RD.RemoteData<AjaxError, TApiGetResponse>>;

  putOneItem$: Observable<(req: TPutResponseShortData) => void>;
  putOneItemStream$: Observable<RD.RemoteData<AjaxError, TApiItem>>;
};

export const itemsViewModel = (): TItemsViewModel => {
  const allItemsDataStreamTrigger$ = new BehaviorSubject<
    RD.RemoteData<AjaxError, TGetResponseShortData[]>
  >(RD.initial);

  const allItemsDataStream$ = allItemsDataStreamTrigger$.pipe(
    scan(
      (
        acc: RD.RemoteData<AjaxError, TGetResponseShortData[]>[],
        value: RD.RemoteData<AjaxError, TGetResponseShortData[]>
      ) => {
        const filteredAcc = acc.filter(
          (item: RD.RemoteData<AjaxError, TGetResponseShortData[]>) =>
            isSuccess(item)
        );

        if (isSuccess(value)) {
          const rdSequence = sequenceT(RD.remoteData)(
            value as RD.RemoteData<AjaxError, TGetResponseShortData[]>,
            ...filteredAcc
          );

          const action = value.value[0].action;

          const rdFinal = pipe(
            rdSequence,
            RD.map((initialItems) => {
              const [firstItem, ...restItems] = initialItems.flat();

              let ind: number;

              switch (action) {
                case "EDIT":
                  ind = restItems.findIndex((v) => v.id === firstItem.id);
                  restItems[ind] = firstItem;
                  return restItems;

                case "DELETE":
                  ind = restItems.findIndex((v) => v.id === firstItem.id);
                  const newRestItemsBefore = restItems.slice(0, ind);
                  const newRestItemsAfter = restItems.slice(ind + 1);
                  return [...newRestItemsBefore, ...newRestItemsAfter];

                case "ADD":
                  return [firstItem, ...restItems];

                default:
                  return [...restItems];
              }
            })
          );

          return [rdFinal];
        }

        return [value, ...filteredAcc];
      },
      []
    )
  );

  const getItemsDataStream$ = getItemsData().pipe(
    tap((value) => allItemsDataStreamTrigger$.next(value))
  );

  const postOneItem$ = of((request: TPostResponseShortData) =>
    postOneItemTrigger$.next(request)
  );
  const postOneItemTrigger$ = new Subject<TPostResponseShortData>();
  const postOneItemStream$ = postOneItemTrigger$.pipe(
    switchMap((req) =>
      postOneItem(req.title, req.body).pipe(
        tap((value) =>
          allItemsDataStreamTrigger$.next(
            pipe(
              value,
              RD.map((value) => [{ ...value, action: TAction.add }])
            )
          )
        )
      )
    )
  );

  const deleteOneItem$ = of((id: TDeleteResponseShortData, item: TApiItem) =>
    deleteOneItemTrigger$.next({ id, item })
  );
  const deleteOneItemTrigger$ = new Subject<{
    id: TDeleteResponseShortData;
    item: TApiItem;
  }>();
  const deleteOneItemStream$ = deleteOneItemTrigger$.pipe(
    switchMap((req) => {
      return deleteOneItem(req.id.id).pipe(
        tap((value) => {
          return allItemsDataStreamTrigger$.next(
            pipe(
              value as RD.RemoteData<AjaxError, TApiItem>,
              RD.map(() => [{ ...req.item, action: TAction.delete }])
            )
          );
        })
      );
    })
  );

  const putOneItem$ = of((request: TPutResponseShortData) =>
    putOneItemTrigger$.next(request)
  );
  const putOneItemTrigger$ = new Subject<TPutResponseShortData>();
  const putOneItemStream$ = putOneItemTrigger$.pipe(
    switchMap((req) =>
      putOneItem(req.id, req.title, req.body, req.userId).pipe(
        tap((value) =>
          allItemsDataStreamTrigger$.next(
            pipe(
              value,
              RD.map((value) => [{ ...value, action: TAction.edit }])
            )
          )
        )
      )
    )
  );

  return {
    allItemsDataStream$,

    getItemsDataStream$,

    postOneItem$,
    postOneItemStream$,

    deleteOneItem$,
    deleteOneItemStream$,

    putOneItem$,
    putOneItemStream$,
  };
};
