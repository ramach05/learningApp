import React, { useState } from "react";
import * as RD from "@devexperts/remote-data-ts";
import {
  TDeleteResponseShortData,
  TGetResponseShortData,
  TPostResponseShortData,
  TPutResponseShortData,
} from "../view-models/item.view-model";
import { AjaxError } from "rxjs/ajax";
import { pipe } from "fp-ts/pipeable";
import * as O from "fp-ts/Option";
import * as A from "fp-ts/Array";
import * as t from "io-ts";
import * as E from "fp-ts/Either";
import {
  ButtonRefactorItem,
  TRefactorFn,
} from "./buttonRefactorItem.component";
import { TApiItem } from "../controllers/item.controller";

export type TItemsViewProps = {
  getItemsData: RD.RemoteData<AjaxError, TGetResponseShortData[]>;

  postOneItem: (req: TPostResponseShortData) => void;
  deleteOneItem: (id: TDeleteResponseShortData, item: TApiItem) => void;
  putOneItem: (req: TPutResponseShortData) => void;

  allItemsDataStream: RD.RemoteData<AjaxError, TGetResponseShortData[]>[];
};

export const ItemsView = (props: TItemsViewProps) => {
  const [inputState, setInputState] = useState({
    titleInputAdd: "",
    bodyInputAdd: "",
  });

  const isNumArr = t.array(t.number);

  const onDeleteOneItem = (id: TDeleteResponseShortData, item: TApiItem) => {
    props.deleteOneItem(id, item);
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

  const onAddToLocalStorage = (targetId: number) => {
    pipe(
      O.fromNullable(localStorage.getItem("asd")),
      O.map((data) => JSON.parse(data)),
      O.map(isNumArr.decode),
      O.map((s) => {
        if (E.isLeft(s)) {
          console.log("ERROR Either.left :>> ", s.left[0]);
        }
        return s;
      }),
      O.chain(O.fromEither),
      O.filter((arr) => !arr.includes(targetId)),
      O.map((arr) =>
        localStorage.setItem("asd", JSON.stringify(arr.concat(targetId)))
      )
    );
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
        onClick={() => onDeleteOneItem({ id: itemData.id }, itemData)}
      >
        Delete
      </button>

      <button type="button" onClick={() => onAddToLocalStorage(itemData.id)}>
        Add id to LocalStorage
      </button>
    </div>
  );

  const renderItemsFinalData = props.allItemsDataStream.map((rdItem) =>
    pipe(
      rdItem,
      RD.fold(
        () => null,
        () => (
          <div className="loader">
            <div className="loader--bg"></div>
            <p className="loader--title">Loading ...</p>
          </div>
        ),
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
