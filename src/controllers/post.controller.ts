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

    return {
        getPosts, //?-------
    };
};

export const postsController = postsControllerInternal();
