---
mapped_pages:
  - https://www.elastic.co/guide/en/search-ui/current/guides-nextjs-integration.html
applies_to:
  stack:
  serverless:
---

# NextJS Integration [guides-nextjs-integration]

## Integrating Search UI with NextJS Router [guides-nextjs-integration-integrating-search-ui-with-nextjs-router]

Next JS is a popular React framework that provides a number of features out of the box, including server-side rendering, routing, and more.

To take advantage of being able to save the search criteria in the URL, you need to override the existing routing options and use Next Router.

Below is an example of how to do achieve this.

To highlight, we’re using React memo to prevent the component from re-rendering the Search UI chrome when the URL changes.

:::::::{tab-set}

::::::{tab-item} pages/search.jsx

```jsx
import { memo } from "react";
import { useNextRouting } from "../utils/useNextRouting";

export default function App() {
  // useNextRouting is a custom hook that will integrate with Next Router with Search UI config
  // config is search-ui configuration.
  // baseUrl is the path to the search page
  const combinedConfig = useNextRouting(config, "<baseUrl>");
  return <Search config={combinedConfig} />;
}

const Search = memo(({ config }) => {
  return (
    <SearchProvider config={config}>
      <>
        <ResultsPerPage />
        <Results config={config} />
        <Paging />
      </>
    </SearchProvider>
  );
});
```

::::::

::::::{tab-item} utils/useNextRouting.js

```jsx
import { useRouter } from "next/router";
import { useMemo } from "react";

export const useNextRouting = (config, basePathUrl) => {
  const router = useRouter();
  const { asPath } = router;

  const getSearchParamsFromUrl = (url) => {
    return url.match(/\?(.+)/)?.[1] || "";
  };

  const routingOptions = {
    // read and write only the query string to search UI
    // as we are leveraging existing stateToUrl and urlToState functions
    // which are based on the query string
    readUrl: () => {
      return getSearchParamsFromUrl(asPath);
    },
    writeUrl: (url, { replaceUrl }) => {
      const method = router[replaceUrl ? "replace" : "push"];
      const params = Object.fromEntries(new URLSearchParams(url).entries());
      method({ query: { ...router.query, ...params } }, undefined, {
        shallow: true
      });
    },
    routeChangeHandler: (callback) => {
      const handler = (fullUrl) => {
        if (fullUrl.includes(basePathUrl)) {
          callback(getSearchParamsFromUrl(fullUrl));
        }
      };
      router.events.on("routeChangeComplete", handler);
      return () => {
        router.events.off("routeChangeComplete", handler);
      };
    }
  };

  return useMemo(() => {
    return {
      ...config,
      routingOptions
    };
  }, [router.isReady]);
};
```

::::::

:::::::

## Integration with Elasticsearch Connector [guides-nextjs-integration-integration-with-elasticsearch-connector]

We do not advise exposing your Elasticsearch instance to the public. Fortunately with NextJS, we do not need to do this. NextJS makes it very simple to build an API route so we can move the connector to the server side.

To start, we create a connector that will send the `requestState` and `queryConfig` over to the client side.

```js
// located in <root>/services/APIConnector.js

class APIConnector {
  constructor() {}

  onResultClick() {
    // optional. Called when a result has been clicked
  }
  onAutocompleteResultClick() {
    // optional. Called when an autocomplete result has been clicked
  }

  async onSearch(requestState, queryConfig) {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requestState,
        queryConfig
      })
    });
    return response.json();
  }

  async onAutocomplete(requestState, queryConfig) {
    const response = await fetch("api/autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requestState,
        queryConfig
      })
    });
    return response.json();
  }
}

export default APIConnector;
```

then add an `api` folder within `<root>/pages` folder. Add two files, `autocomplete.js` and `search.js`

```js
// located in <root>/pages/api/search.js
import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";

const connector = new ElasticsearchAPIConnector({
  host: "<elasticsearch host>",
  index: "<elasticsearch index>",
  apiKey: "<api key>" // optional
});

export default async function handler(req, res) {
  const { requestState, queryConfig } = req.body;
  const response = await connector.onSearch(requestState, queryConfig);
  res.json(response);
}
```

```js
// located in <root>/pages/api/autocomplete.js
import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";

const connector = new ElasticsearchAPIConnector({
  host: "<elasticsearch host>",
  index: "<elasticsearch index>",
  apiKey: "<api key>" // optional
});

export default async function handler(req, res) {
  const { requestState, queryConfig } = req.body;
  const response = await connector.onAutocomplete(requestState, queryConfig);
  res.json(response);
}
```

then lastly swap the elasticsearch connector to use the APIConnector. With this change, when a user searches, the search will be sent to the server and the API routes will fetch the results from Elasticsearch and will be sent back to the client.

```js
import Connector from "../services/APIConnector";

const apiConnector = new Connector();

const searchConfig = {
  apiConnector: apiConnector
  // ...truncated search configuration
};
```

and then restart your nextjs app. To confirm that this is working, you should see network requests within chrome developer tools performing requests with `requestState` and `queryConfig` to the `/api/search` & `/api/autocomplete` API routes and results being returned back to the client.

:::{tip}
Try out this implementation in our [CodeSandbox demo](https://codesandbox.io/embed/cool-blackwell-69qutv?fontsize=14&hidenavigation=1&theme=dark).
:::
