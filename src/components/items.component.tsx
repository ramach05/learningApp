import React, { useState } from "react";
import * as RD from "@devexperts/remote-data-ts";
import {
  TPostResponseShortData,
  TRequest,
} from "../view-models/item.view-model";
import { AjaxError } from "rxjs/ajax";
import { pipe } from "fp-ts/pipeable";
import { ButtonRefactorItem } from "./buttonRefactorItem.component";

export type TPostsViewProps = {
  getPostsData: RD.RemoteData<AjaxError, TPostResponseShortData[]>;
  postOneItem: (req: TRequest) => void;
  deleteOneItem: (id: number) => void;
};

export const PostsView = (props: TPostsViewProps) => {
  const [inputState, setInputState] = useState({
    titleInputAdd: "",
    bodyInputAdd: "",
  });

  const renderPostsInfo = (itemData: TPostResponseShortData) => (
    <div className="item" key={itemData.id}>
      <h3 className="item--title">Title: {itemData.title}</h3>
      <p className="item--body">{itemData.body}</p>

      <ButtonRefactorItem
        initialTitle={itemData.title}
        initialBody={itemData.body}
      />

      <button type="button" onClick={() => onDeleteOneItem(itemData.id)}>
        Delete
      </button>
    </div>
  );

  const onDeleteOneItem = (id: number) => {
    props.deleteOneItem(id);
  };

  const onRefactorItem = (id: number, title: string, body: string) => {};

  const onAddOneItem = (e: any) => {
    e.preventDefault();
    props.postOneItem({
      title: inputState.titleInputAdd,
      body: inputState.bodyInputAdd,
    });
  };

  const handleChangeInput = (e: any) => {
    console.log("inputState :>> ", inputState);

    const { id, value } = e.target;

    if (id === "add-input-title") {
      return setInputState((prev) => ({
        ...prev,
        titleInputAdd: value,
      }));
    }
    if (id === "add-input-body") {
      return setInputState((prev) => ({
        ...prev,
        bodyInputAdd: value,
      }));
    }
  };

  console.log("props.getPostsData :>> ", props.getPostsData);

  return pipe(
    props.getPostsData,
    RD.fold(
      () => null,
      () => <p>Loading ...</p>,
      () => null,
      (data) => (
        <section className="sectionItems">
          <h1>All posts</h1>

          <form onSubmit={onAddOneItem}>
            <input
              id="add-input-title"
              type="text"
              autoComplete="off"
              placeholder="Title"
              onChange={handleChangeInput}
              value={inputState.titleInputAdd}
            />
            <input
              id="add-input-body"
              type="text"
              autoComplete="off"
              placeholder="Body"
              onChange={handleChangeInput}
              value={inputState.bodyInputAdd}
            />
            <button type="submit">Add one item</button>
          </form>

          {data.map(renderPostsInfo)}
        </section>
      )
    )
  );
};
