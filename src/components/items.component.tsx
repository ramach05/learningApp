import React, { useEffect, useMemo, useState } from "react";
import * as RD from "@devexperts/remote-data-ts";
import {
  TDeleteResponseShortData,
  TGetResponseShortData,
  TPostResponseShortData,
  TPutResponseShortData,
} from "../view-models/item.view-model";
import { AjaxError } from "rxjs/ajax";
import { pipe } from "fp-ts/pipeable";
import { ButtonRefactorItem } from "./buttonRefactorItem.component";

export type TItemsViewProps = {
  getItemsData: RD.RemoteData<AjaxError, TGetResponseShortData[]>;
  postOneItem: (req: TPostResponseShortData) => void;
  deleteOneItem: (req: TDeleteResponseShortData) => void;
  putOneItemStream: (req: TPutResponseShortData) => void;
};

export const ItemsView = (props: TItemsViewProps) => {
  // console.log("props.getItemsData :>> ", props.getItemsData);
  // console.log("props.getItemsData.value :>> ", props.getItemsData.value || []);

  // console.log("props :>> ", props);

  const [dataItems, setDataItems] = useState();
  // const [dataItems, setDataItems] = useState([] as TGetResponseShortData[]);

  const [inputState, setInputState] = useState({
    titleInputAdd: "",
    bodyInputAdd: "",
  });

  const onDeleteOneItem = (id: TDeleteResponseShortData) => {
    props.deleteOneItem(id);
  };

  const onRefactorItem = ({
    id,
    title,
    body,
    userId,
  }: {
    id: number;
    title: string;
    body: string;
    userId: number;
  }) => {
    props.putOneItemStream({ userId, id, title, body });
  };

  const onAddOneItem = (e: any) => {
    e.preventDefault();
    props.postOneItem({
      title: inputState.titleInputAdd,
      body: inputState.bodyInputAdd,
    });
  };

  const handleChangeInput = (e: any) => {
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

  // const renderAddedItems = () => {
  //   pipe(
  //     props.getItemsData,
  //     RD.fold(
  //       () => null,
  //       () => <p>Loading ...</p>,
  //       () => null,
  //       (data) => {
  //         return setDataItems(data);
  //       }
  //     )
  //   );
  // };

  const renderItems = (itemData: TPutResponseShortData) => (
    <div className="item" key={itemData.id}>
      <h3 className="item--title">Title: {itemData.title}</h3>
      <p className="item--body">{itemData.body}</p>

      <ButtonRefactorItem
        initialTitle={itemData.title}
        initialBody={itemData.body}
        onRefactorItem={onRefactorItem}
        id={itemData.id}
        userId={itemData.userId}
      />

      <button
        type="button"
        onClick={() => onDeleteOneItem({ id: itemData.id })}
      >
        Delete
      </button>
    </div>
  );

  return pipe(
    props.getItemsData,
    RD.fold(
      () => null,
      () => <p>Loading ...</p>,
      () => null,
      (data) => {
        return (
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
              <button type="submit">Add one post</button>
            </form>

            {data.map(renderItems)}
          </section>
        );
      }
    )
  );
};
