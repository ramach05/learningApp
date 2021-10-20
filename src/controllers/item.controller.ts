import { Api } from "../service/service";

export type TApiItem = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

export type TApiGetResponse = TApiItem[];

const postsControllerInternal = () => {
  const getPosts = () =>
    Api.get<TApiGetResponse>("https://jsonplaceholder.typicode.com/posts");

  const postItem = (title: string, body: string, userId: number = 42) =>
    Api.post<TApiGetResponse>("https://jsonplaceholder.typicode.com/posts", {
      title,
      body,
      userId,
    });

  const deleteItem = (id: number) =>
    Api.delete<TApiGetResponse>(
      `https://jsonplaceholder.typicode.com/posts/${id}`
    );

  return {
    getPosts,
    postItem,
    deleteItem,
  };
};

export const postsController = postsControllerInternal();
