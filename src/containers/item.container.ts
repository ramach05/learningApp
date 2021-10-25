import { ask, combineContext } from "@devexperts/rx-utils/dist/context.utils";
import { withRX } from "@devexperts/react-kit/dist/utils/with-rx2";
import {
  itemsViewModel,
  TItemsViewModel,
} from "../view-models/item.view-model";
import { ItemsView, TItemsViewProps } from "../components/items.component";
import { runOnMount } from "../utils/react.util";
import { Sink } from "@devexperts/rx-utils/dist/sink.utils";
import * as RD from "@devexperts/remote-data-ts";
import { merge } from "rxjs";
import { constUndefined } from "fp-ts/function";

export type ItemsContainerContext = {
  itemsViewModel: TItemsViewModel;
};

const Container = combineContext(ask<ItemsContainerContext>(), (e) =>
  withRX<TItemsViewProps>(ItemsView)(() => {
    const {
      itemsViewModel: {
        allItemsDataStream$,

        getItemsDataStream$,

        postOneItem$,
        postOneItemStream$,

        deleteOneItem$,
        deleteOneItemStream$,

        putOneItem$,
        putOneItemStream$,
      },
    } = e;

    return {
      props: {
        allItemsDataStream: allItemsDataStream$,

        getItemsData: getItemsDataStream$,

        postOneItem: postOneItem$,

        deleteOneItem: deleteOneItem$,

        putOneItem: putOneItem$,
      },
      defaultProps: {
        allItemsDataStream: [RD.initial],

        getItemsData: RD.initial,
        postOneItem: constUndefined,
        deleteOneItem: constUndefined,
        putOneItem: constUndefined,
      },
      effects$: merge(
        postOneItemStream$,
        deleteOneItemStream$,
        putOneItemStream$
      ),
    };
  })
);

export const ItemsContainer = runOnMount(
  Container,
  () =>
    new Sink({
      itemsViewModel: itemsViewModel(),
    })
);
