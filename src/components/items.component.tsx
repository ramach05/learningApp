import React, { useState } from "react";
import * as RD from "@devexperts/remote-data-ts";
import {
  TPostResponseShortData,
  TRequest,
} from "../view-models/item.view-model";
import { AjaxError } from "rxjs/ajax";
import { pipe } from "fp-ts/pipeable";

export type TPostsViewProps = {
  getPostsData: RD.RemoteData<AjaxError, TPostResponseShortData[]>;
  postOneItem: (req: TRequest) => void;
  deleteOneItem: (id: number) => void;
};

export const PostsView = (props: TPostsViewProps) => {
  const [inputState, setInputState] = useState({
    titleInput: "",
    bodyInput: "",
  });

  console.log("inputState :>> ", inputState);

  const renderPostsInfo = (postInfo: TPostResponseShortData) => (
    <div className="post" key={postInfo.id}>
      <h3 className="post--title">Title: {postInfo.title}</h3>
      <p className="post--body">{postInfo.body}</p>

      {/* <button type="button">Refactor</button>
      <form onSubmit={onRefactorItem}>
        <input
          id="refactor-input-title"
          type="text"
          autoComplete="off"
          placeholder="Title"
          onChange={handleChangeInput}
          value={inputState.titleInput}
        />
        <input
          id="refactor-input-body"
          type="text"
          autoComplete="off"
          placeholder="Body"
          onChange={handleChangeInput}
          value={inputState.bodyInput}
        />
        <button type="submit">ОК</button>
      </form> */}

      <button type="button" onClick={() => onDeleteOneItem(postInfo.id)}>
        Delete
      </button>
    </div>
  );

  const onDeleteOneItem = (id: number) => {
    props.deleteOneItem(id);
  };

  const onAddOneItem = (e: any) => {
    e.preventDefault();
    props.postOneItem({
      title: inputState.titleInput,
      body: inputState.bodyInput,
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
        <section className="sectionPosts">
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
