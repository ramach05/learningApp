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
import {
  ButtonRefactorItem,
  TRefactorFn,
} from "./buttonRefactorItem.component";
import { TApiGetResponse, TApiItem } from "../controllers/item.controller";

export type TItemsViewProps = {
  getItemsData: RD.RemoteData<AjaxError, TGetResponseShortData[]>;

  postOneItem: (req: TPostResponseShortData) => void;
  deleteOneItem: (req: TDeleteResponseShortData) => void;
  putOneItem: (req: TPutResponseShortData) => void;

  allItemsDataStream: RD.RemoteData<AjaxError, TGetResponseShortData[]>[];

  // postOneItemStream: RD.RemoteData<AjaxError, TApiItem>;
  // deleteOneItemStream: RD.RemoteData<AjaxError, TApiGetResponse>;
  // putOneItemStream: RD.RemoteData<AjaxError, TApiGetResponse>;
};

export const ItemsView = (props: TItemsViewProps) => {
  // console.log("props :>> ", props);

  const [inputState, setInputState] = useState({
    titleInputAdd: "",
    bodyInputAdd: "",
  });

  const onDeleteOneItem = (id: TDeleteResponseShortData) => {
    props.deleteOneItem(id);
  };

  const onRefactorItem = (e: any, { id, title, body, userId }: TRefactorFn) => {
    e.preventDefault();
    props.putOneItem({ userId, id, title, body });
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

  const renderItems = (itemData: TGetResponseShortData) => (
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

  console.log("allItemsDataStream :>> ", props.allItemsDataStream);

  const renderItemsFinalData = props.allItemsDataStream.map((rdItem) =>
    pipe(
      rdItem,
      RD.fold(
        () => null,
        () => <p>Loading ...</p>,
        (e) => {
          console.log("ERROR: ", e);
          return null;
        },
        (data) => <>{data.map((item) => renderItems(item))}</>
      )
    )
  );

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

      {renderItemsFinalData}
    </section>
  );
};
