// import * as React from 'react';
import * as RD from '@devexperts/remote-data-ts';
import { TPostsShortData } from '../view-models/planets.view-model';
import { AjaxError } from 'rxjs/ajax';
import { pipe } from 'fp-ts/pipeable';

export type TPostsViewProps = {
    getPostsData: RD.RemoteData<AjaxError, TPostsShortData[]>;
}

const renderPlanetInfo = (postInfo: TPostsShortData) =>
    <div key={postInfo.id}>
        <h3>Title: {postInfo.title}</h3>
        <p>{postInfo.body}</p>
    </div>;


const LoadingSpinner = () => <p>Loading ...</p>;

export const PostsView = (props: TPostsViewProps) => //?-------
    pipe(
        props.getPostsData,
        RD.fold(
            () => null,
            () => LoadingSpinner(),
            () => null,
            (data) => (
                <section>
                    <h1>Planets</h1>
                    {data.map(renderPlanetInfo)}
                </section>
            )
        ),
    );
