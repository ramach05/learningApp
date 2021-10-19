import * as React from "react";
import * as RD from "@devexperts/remote-data-ts";
import { TPostResponseShortData } from "../view-models/posts.view-model";
import { AjaxError } from "rxjs/ajax";
import { pipe } from "fp-ts/pipeable";

export type TPostsViewProps = {
  getPostsData: RD.RemoteData<AjaxError, TPostResponseShortData[]>;
  postOneItem: () => void;
};

export const PostsView = (props: TPostsViewProps) => {
  const renderPostsInfo = (postInfo: TPostResponseShortData) => (
    <div key={postInfo.id}>
      <h3>Title: {postInfo.title}</h3>
      <p>{postInfo.body}</p>
    </div>
  );

  const onAddOneItem = (e: any) => {
    e.preventDefault();
    props.postOneItem();
  };

  return pipe(
    props.getPostsData,
    RD.fold(
      () => null,
      () => <p>Loading ...</p>,
      () => null,
      (data) => (
        <section>
          <h1>All posts</h1>

          <form onSubmit={onAddOneItem}>
            <input type="text" autoComplete="off" placeholder="Title" />
            <input type="text" autoComplete="off" placeholder="Body" />
            <button type="submit">Add one item</button>
          </form>

          {data.map(renderPostsInfo)}
        </section>
      )
    )
  );
};
