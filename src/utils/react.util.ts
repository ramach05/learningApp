import { ComponentClass, ComponentType, createElement, PureComponent } from 'react';
import { Subscription } from 'rxjs';
import { Context } from '@devexperts/rx-utils/dist/context.utils';
import { Sink } from '@devexperts/rx-utils/dist/sink.utils';

export const runOnMount = <E, P>(
    Target: Context<E, ComponentType<P>>,
    provide: (props: P) => Sink<E>,
): ComponentClass<P> =>
    class Wrapper extends PureComponent<P> {
        private subscription: Subscription | undefined;
        private effectSubscription: Subscription | undefined;

        private unsubscribe() {
            this.subscription && this.subscription.unsubscribe();

            this.effectSubscription && this.effectSubscription.unsubscribe();
        }

        componentWillUnmount() {
            this.unsubscribe();
        }

        render() {
            this.unsubscribe();
            const effectE = provide(this.props);
            this.effectSubscription = effectE.sink$.subscribe();
            const { sink$, value } = Target.run(effectE.value);
            this.subscription = sink$.subscribe();
            return createElement(value, this.props);
        }
    };
