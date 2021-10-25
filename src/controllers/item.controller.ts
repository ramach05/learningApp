import { Api } from "../service/service";

export enum TAction {
  edit = "EDIT",
  delete = "DELETE",
  add = "ADD",
}

export type TApiItem = {
  userId: number;
  id: number;
  title: string;
  body: string;
  action?: TAction;
};

export type TApiGetResponse = TApiItem[];

const itemsControllerInternal = () => {
  const getItems = () =>
    Api.get<TApiGetResponse>("https://jsonplaceholder.typicode.com/posts");

  const postItem = (title: string, body: string, userId: number = 42) =>
    Api.post<TApiItem>("https://jsonplaceholder.typicode.com/posts", {
      title,
      body,
      userId,
    });

  const deleteItem = (id: number) =>
    Api.delete<TApiGetResponse>(
      `https://jsonplaceholder.typicode.com/posts/${id}`
    );

  const putItem = (
    id: number,
    title: string,
    body: string,
    userId: number = 42
  ) =>
    Api.put<TApiItem>(`https://jsonplaceholder.typicode.com/posts/${id}`, {
      id,
      title,
      body,
      userId,
    });

  return {
    getItems,
    postItem,
    deleteItem,
    putItem,
  };
};

export const itemsController = itemsControllerInternal();
