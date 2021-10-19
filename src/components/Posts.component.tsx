// import * as React from 'react';
import * as RD from '@devexperts/remote-data-ts';
import { TPostResponseShortData } from '../view-models/posts.view-model';
import { AjaxError } from 'rxjs/ajax';
import { pipe } from 'fp-ts/pipeable';

export type TPostsViewProps = {
    getPostsData: RD.RemoteData<AjaxError, TPostResponseShortData[]>;
    postOneTitle: RD.RemoteData<AjaxError, TPostResponseShortData[]>;
}

const renderPostsInfo = (postInfo: TPostResponseShortData) =>
    <div key={postInfo.id}>
        <h3>Title: {postInfo.title}</h3>
        <p>{postInfo.body}</p>
    </div>;


const LoadingSpinner = () => <p>Loading ...</p>;

export const PostsView = (props: TPostsViewProps) => {
    const onAddOneItem = () => {
        console.log('props :>> ', props);
        // props.postOneTitle();
    }


    return pipe(
        props.getPostsData,
        RD.fold(
            () => null,
            () => LoadingSpinner(),
            () => null,
            (data) => (
                <section>
                    <h1>All posts</h1>
                    <button type='button' onClick={onAddOneItem}>Add one item</button>
                    {data.map(renderPostsInfo)}
                </section>
            )
        ),
    );
}