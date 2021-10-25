import {
  itemsController,
  TApiGetResponse,
  TApiItem,
} from "../controllers/item.controller";
import { scan, skip, tap } from "rxjs/operators";
import { switchMap } from "rxjs/internal/operators";
import { BehaviorSubject, Observable, of, Subject } from "rxjs";
import * as RD from "@devexperts/remote-data-ts";
import { AjaxError } from "rxjs/ajax";
import {
  combine,
  isFailure,
  isInitial,
  isPending,
  isSuccess,
} from "@devexperts/remote-data-ts";
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

  deleteOneItem$: Observable<(req: TDeleteResponseShortData) => void>;
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
        console.log("value :>> ", value);

        const filteredAcc = acc.filter(
          (item: RD.RemoteData<AjaxError, TGetResponseShortData[]>) => {
            // console.log("item :>> ", item);
            return isSuccess(item);
          }
        );

        console.log("filteredAcc :>> ", filteredAcc);

        if (isSuccess(value)) {
          const rd5 = sequenceT(RD.remoteData)(
            value as RD.RemoteData<AjaxError, TGetResponseShortData[]>,
            ...filteredAcc
          );

          const rd6 = pipe(
            rd5,
            RD.map((initialItems) => {
              const [firstItem, ...restItems] = initialItems.flat();
              const ind = restItems.findIndex((v) => v.id === firstItem.id);

              if (ind === -1) {
                return [firstItem, ...restItems];
              }

              restItems[ind] = firstItem;
              console.log("items rd6 :>> ", restItems);
              return restItems;
            })
          );

          console.log("rd5 :>> ", rd5);
          console.log("rd6 :>> ", rd6);

          return [rd6];
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
              RD.map((value) => [value])
            )
          )
        )
      )
    )
  );

  const deleteOneItem$ = of((id: TDeleteResponseShortData) =>
    deleteOneItemTrigger$.next(id)
  );
  const deleteOneItemTrigger$ = new Subject<TDeleteResponseShortData>();
  const deleteOneItemStream$ = deleteOneItemTrigger$.pipe(
    switchMap((req) => {
      console.log("id :>> ", req.id);

      return deleteOneItem(req.id).pipe(
        tap((value) => {
          console.log("value deleteOneItem :>> ", value);

          return allItemsDataStreamTrigger$.next(
            pipe(
              value as RD.RemoteData<AjaxError, TApiItem>,
              RD.map((value) => [value])
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
              RD.map((value) => [value])
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
