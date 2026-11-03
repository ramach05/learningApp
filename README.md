> **Archived.** Learning project from 2021, kept as a starting point.

# Learning App

React + TypeScript app (Create React App) doing CRUD on `jsonplaceholder` posts through an RxJS `ajax` client that returns `RemoteData` values. State flows through an MVVM-style split: `components` / `containers` / `controllers` / `view-models` / `service`, wired with `@devexperts/react-kit` and `rx-utils` contexts. Responses are validated with io-ts; selected item ids persist to `localStorage`.

Practice project for functional-reactive patterns in React (fp-ts, rxjs, io-ts); the UI is intentionally minimal.

## Run

```bash
yarn install
yarn start
```
