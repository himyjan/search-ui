---
navigation_title: "API reference"
mapped_pages:
  - https://www.elastic.co/guide/en/search-ui/current/api-architecture.html
applies_to:
  stack:
  serverless:
---

# Architecture [api-architecture]

```txt
                                    |
    @elastic/react-search-ui        |   @elastic/search-ui
                                    |
                                    |
          SearchProvider <--------------- SearchDriver
              |     |               |          |
   State /    |     |               |          | State /
   Actions    |     |               |          | Actions
              |     |               |          |
        Components  |               |          |
              |     |               |          |
              v     v               |          v
------------------------------------+----------------------------
              |     |                          |
              v     v                          v
          Using     Headless Usage       Headless Usage outside
     Components     in React             of React
```

The core is a separate, vanilla JS library which can be used for any JavaScript based implementation.

The Headless Core implements the functionality behind a search experience, but without its own view. It provides the underlying "state" and "actions" associated with that view. For instance, the core provides a `setSearchTerm` action, which can be used to save a `searchTerm` property in the state. Calling `setSearchTerm` using the value of an `<input>` will save the `searchTerm` to be used to build a query.

All of the Components in this library use the Headless Core under the hood. For instance, Search UI provides a `SearchBox` Component for collecting input from a user. But you are not restricted to using just that Component. Since Search UI lets you work directly with "state" and "actions", you could use any type of input you want! As long as your input or Component calls the Headless Core’s `setSearchTerm` action, it will "just work". This gives you maximum flexibility over your experience if you need more than the Components in Search UI have to offer.

The `SearchProvider` is a React wrapper around the Headless Core, and makes state and actions available to Search UI and in a React [Context](https://reactjs.org/docs/context.html), and also via a [Render Prop](https://reactjs.org/docs/render-props.html).
