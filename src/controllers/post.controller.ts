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

  const postItem = (title: string, body: string) =>
    Api.post<TApiGetResponse>("https://jsonplaceholder.typicode.com/posts", {
      title,
      body,
    });

  return {
    getPosts,
    postItem,
  };
};

export const postsController = postsControllerInternal();
