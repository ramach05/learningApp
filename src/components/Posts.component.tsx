import React, { useState } from "react";
import * as RD from "@devexperts/remote-data-ts";
import { TPostResponseShortData, TRequest } from "../view-models/posts.view-model";
import { AjaxError } from "rxjs/ajax";
import { pipe } from "fp-ts/pipeable";

export type TPostsViewProps = {
  getPostsData: RD.RemoteData<AjaxError, TPostResponseShortData[]>;
  postOneItem: (req: TRequest) => void;
};

export const PostsView = (props: TPostsViewProps) => {
  const [inputState, setInputState] = useState({
    titleInput: "",
    bodyInput: "",
  });

  console.log("inputState :>> ", inputState);

  const renderPostsInfo = (postInfo: TPostResponseShortData) => (
    <div key={postInfo.id}>
      <h3>Title: {postInfo.title}</h3>
      <p>{postInfo.body}</p>
    </div>
  );

  const onAddOneItem = (e: any) => {
    e.preventDefault();
    props.postOneItem({
        title: inputState.titleInput,
        body: inputState.bodyInput
    });
  };

  const handleChangeInput = (e: any) => {
    if (e.target.id === "input-title") {
      return setInputState((prev) => ({ ...prev, titleInput: e.target.value }));
    }
    if (e.target.id === "input-body") {
      return setInputState((prev) => ({ ...prev, bodyInput: e.target.value }));
    }
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
            <input
              id="input-title"
              type="text"
              autoComplete="off"
              placeholder="Title"
              onChange={handleChangeInput}
              value={inputState.titleInput}
            />
            <input
              id="input-body"
              type="text"
              autoComplete="off"
              placeholder="Body"
              onChange={handleChangeInput}
              value={inputState.bodyInput}
            />
            <button type="submit">Add one item</button>
          </form>

          {data.map(renderPostsInfo)}
        </section>
      )
    )
  );
};
