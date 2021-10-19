import { ask, combineContext } from "@devexperts/rx-utils/dist/context.utils";
import { withRX } from "@devexperts/react-kit/dist/utils/with-rx2";
import {
  postsViewModel,
  TPostsViewModel,
} from "../view-models/posts.view-model";
import { PostsView, TPostsViewProps } from "../components/Posts.component";
import { runOnMount } from "../utils/react.util";
import { Sink } from "@devexperts/rx-utils/dist/sink.utils";
import * as RD from "@devexperts/remote-data-ts";

export type PostsContainerContext = {
  postViewModel: TPostsViewModel;
};

const Container = combineContext(ask<PostsContainerContext>(), (e) =>
  withRX<TPostsViewProps>(PostsView)(() => {
    const {
      postViewModel: { getPostsData$, postOneTitle$ },
    } = e;

    return {
      props: {
        getPostsData: getPostsData$,
        postOneTitle: postOneTitle$,
      },
      defaultProps: {
        getPostsData: RD.initial,
        postOneTitle: RD.initial,
      },
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
