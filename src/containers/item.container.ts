import { ask, combineContext } from "@devexperts/rx-utils/dist/context.utils";
import { withRX } from "@devexperts/react-kit/dist/utils/with-rx2";
import {
  postsViewModel,
  TPostsViewModel,
} from "../view-models/item.view-model";
import { PostsView, TPostsViewProps } from "../components/items.component";
import { runOnMount } from "../utils/react.util";
import { Sink } from "@devexperts/rx-utils/dist/sink.utils";
import * as RD from "@devexperts/remote-data-ts";
import { merge } from "rxjs";
import { constUndefined } from "fp-ts/function";

export type PostsContainerContext = {
  postViewModel: TPostsViewModel;
};

const Container = combineContext(ask<PostsContainerContext>(), (e) =>
  withRX<TPostsViewProps>(PostsView)(() => {
    const {
      postViewModel: {
        getPostDataStream$,

        postOneItem$,
        postOneItemStream$,

        deleteOneItem$,
        deleteOneItemStream$,
      },
    } = e;

    return {
      props: {
        getPostsData: getPostDataStream$,
        postOneItem: postOneItem$,
        deleteOneItem: deleteOneItem$,
      },
      defaultProps: {
        getPostsData: RD.initial,
        postOneItem: constUndefined,
        deleteOneItem: constUndefined,
      },
      effects$: merge(postOneItemStream$, deleteOneItemStream$), //?---------------
    };
  })
);

export const PostsContainer = runOnMount(
  Container,
  () =>
    new Sink({
      postViewModel: postsViewModel(),
    })
);
