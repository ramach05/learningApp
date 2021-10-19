import { Api } from "../service/service";

export type TApiItem = {
  userId: number;
  id: number;
  title: string;
  body: string;
};

type TApiGetResponse = TApiItem[];

const postsControllerInternal = () => {
  const getPosts = () =>
    Api.get<TApiGetResponse>("https://jsonplaceholder.typicode.com/posts");
  const postItem = () =>
    Api.post<TApiGetResponse>("https://jsonplaceholder.typicode.com/posts", {
      title: "new title 4242",
      body: "new body 424242",
    });

  return {
    getPosts,
    postItem,
  };
};

export const postsController = postsControllerInternal();
