---
mapped_pages:
  - https://www.elastic.co/guide/en/search-ui/current/api-connectors-elasticsearch.html
---

# Elasticsearch Connector [api-connectors-elasticsearch]

Search UI provides a way to connect to Elasticsearch directly without needing Enterprise Search. This is useful for when you dont need the features of Enterprise Search, such as relevance tuning.

The connector uses the same Search UI configuration that other connectors use.

You must specify either the cloud id or on-premise host url for the Elasticsearch connector.

```js
import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";

const connector = new ElasticsearchAPIConnector({
  // Either specify the cloud id or host to connect to elasticsearch
  cloud: {
    id: "<elastic-cloud-id>" // cloud id found under your cloud deployment overview page
  },
  host: "http://localhost:9200", // host url for the Elasticsearch instance
  index: "<index-name>", // index name where the search documents are contained
  apiKey: "<api-key>", // Optional. apiKey used to authorize a connection to Elasticsearch instance.
  // This key will be visible to everyone so ensure its setup with restricted privileges.
  // See Authentication section for more details.
  connectionOptions: {
    // Optional connection options.
    headers: {
      "x-custom-header": "value" // Optional. Specify custom headers to send with the request
    }
  }
});
```

| Param             | Description                                                                                                                                                      |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| cloud             | Required if `host` not provided. Object type. The cloud id for the deployment within elastic cloud.                                                              |
| host              | Required if `cloud` not provided. String type. The host url to the Elasticsearch instance                                                                        |
| index             | Required. String type. The search index name                                                                                                                     |
| apiKey            | Optional. a credential used to access the Elasticsearch instance. See [Connection & Authentication](#api-connectors-elasticsearch-connection-and-authentication) |
| connectionOptions | Optional. Object containing `headers` dictionary of header name to header value.                                                                                 |

## Differences between App Search and Elasticsearch connector [api-connectors-elasticsearch-differences-between-app-search-and-elasticsearch-connector]

### Applying Filters to Range Facets [api-connectors-elasticsearch-applying-filters-to-range-facets]

Elasticsearch connector differs in the way filters can be applied to facets. Currently its not possible to apply an explicit range filter to range facets. Elasticsearch connector uses the name thats been given to the option to apply the filter. It uses this name to match the option and creates a the range filter query for the option.

#### Example Facet Configuration [api-connectors-elasticsearch-example-facet-configuration]

```js
{
  visitors: {
    type: "range",
    ranges: [
      { from: 0, to: 10000, name: "0 - 10000" },
      { from: 10001, to: 100000, name: "10001 - 100000" },
      { from: 100001, to: 500000, name: "100001 - 500000" },
      { from: 500001, to: 1000000, name: "500001 - 1000000" },
      { from: 1000001, to: 5000000, name: "1000001 - 5000000" },
      { from: 5000001, to: 10000000, name: "5000001 - 10000000" },
      { from: 10000001, name: "10000001+" }
    ]
  }
}
```

#### How to apply the filter [api-connectors-elasticsearch-how-to-apply-the-filter]

```js
setFilter("visitors", {
  name: "10001 - 100000", // name of the option
  from: 10001, // both from and to will be ignored
  to: 100000
});
```

#### Applying a range to a field that isn’t a facet [api-connectors-elasticsearch-applying-a-range-to-a-field-that-isnt-a-facet]

If the field isn’t a facet, you will be able to apply filters to the search using `value`, `numeric range` and `date range`, depending on the field type.

```js
setFilter("precio", {
  name: "precio",
  from: rangePrices[0],
  to: rangePrices[1]
});
```

### _None_ Filter Type [api-connectors-elasticsearch-none-filter-type]

Currently the None filter type is not supported. If this is a feature thats needed, please mention it in this [issue](https://github.com/elastic/search-ui/issues/783).

## Connection & Authentication [api-connectors-elasticsearch-connection-and-authentication]

::::{admonition} A note about security
:class: important

This connector will talk to the Elasticsearch instance directly from the browser. We **strongly** suggest you take additional steps to keep your Elasticsearch instance as secure as possible.

::::

You have the following options available to you for securely exposing your Elasticsearch instance to the internet:

### Proxy the \_search API call through your API [api-connectors-elasticsearch-proxy-the-_search-api-call-through-your-api]

This envolves building an API route that will proxy the Elasticsearch call through your API. During the proxy, you are able to:

- Ability to add any additional authentication headers / keys as you proxy the request through the API and to Elasticsearch.
- Update the Elasticsearch query request to add any filters to filter restricted documents
- Application performance monitoring of functionality
- Your own user based authentication for your API
- Add a caching layer between the API and Elasticsearch

The connector will perform a `_search` query and will derive the endpoint path with the host and index. With `http://localhost:9200` host and `search-ui-example` index, the endpoint path will be `http://localhost:9200/search-ui-example/_search`. The connector will make a POST call with the elasticsearch query in the body of the request. To proxy the request through your API, you need to implement a route and update the connector’s settings to use the proxy route.

### Use an Elasticsearch api-key [api-connectors-elasticsearch-use-an-elasticsearch-api-key]

You can restrict access to indices by using an API key. We recommend you create an apiKey that is restricted to the particular index and has read-only authorization. See [Kibana API keys guide](docs-content://deploy-manage/api-keys/elasticsearch-api-keys.md). To use the API key, place it within the Elasticsearch connection configuration.

## Autocomplete [api-connectors-elasticsearch-autocomplete]

Search UI supports autocomplete functionality to suggest search terms that provide results. The autocomplete functionality is built on top of the Elasticsearch `suggest` and `bool prefix query` API.

To take advantage of the feature, first update the [autocomplete query](/reference/api-core-configuration.md#api-core-configuration-autocomplete-query) configuration.

Below is an example of what the `autocompleteQuery` may look like.

```js
autocompleteQuery: {
  // performs a prefix search on the query
  results: {
    resultsPerPage: 5, // number of results to display. Default is 5.
    search_fields: {
      // the fields to prefix search on
      title_suggest: {}
    },
    result_fields: {
      // Add snippet highlighting within autocomplete suggestions
      title: { snippet: { size: 100, fallback: true }},
      nps_link: { raw: {} }
    }
  },
  // performs a query to suggest for values that partially match the incomplete query
  suggestions: {
    types: {
      // Limit query to only suggest based on "title" field
      documents: {  fields: ["title_completion"] }
    },
    // Limit the number of suggestions returned from the server
    size: 4
  }
}
```

Above we are configuring both the `results` and `suggestions` sections of the autocomplete query.

`results` will need a search field to perform a prefix search on the query. We advise using a `search_as_you_type` field to be used. `suggestions` require a `completion` type field to perform a query to suggest for values that partially match the incomplete query.

Below is an example of the mappings for the above example. `title_suggest` is a `search_as_you_type` field and `title_completion` is a `completion` type field.

```json
{
  "mappings": {
    "properties": {
      "title_suggest": {
        "type": "search_as_you_type"
      },
      "title_completion": {
        "type": "completion"
      }
    }
  }
}
```

With a combination of this configuration + the [Searchbox](/reference/api-react-components-search-box.md) component with autocomplete configuration, your users will be able to see suggestions as they type within the search box.

## Node.js Integration [api-connectors-elasticsearch-nodejs-integration]

The Elasticsearch API Connector builds the Elasticsearch query and performs the request directly to Elasticsearch from the browser. Depending on what you’re building, you may want this logic to be done on the server and provide your clients a simplified API.

First step is to implement two routes to handle `search` and `autocomplete` requests. In example below, we are using express.js framework to implement these http routes within node.js.

```js
// index.js

var express = require("express");
var APIConnector =
  require("@elastic/search-ui-elasticsearch-connector").default;
require("cross-fetch/polyfill");

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const connector = new APIConnector({
  host: "http://localhost:9200", // host url for the Elasticsearch instance
  index: "search-ui-examples", // index name where the search documents are contained
  apiKey: "apiKeyExample" // Optional. apiKey used to authorize a connection to Elasticsearch instance.
});

app.post("/search", async (req, res) => {
  const { query, options } = req.body;
  const response = await connector.onSearch(query, options);
  res.json(response);
});

app.post("/autocomplete", async (req, res) => {
  const { query, options } = req.body;
  const response = await connector.onAutocomplete(query, options);
  res.json(response);
});

var listener = app.listen(8080, function () {
  console.log("Listening on port " + listener.address().port);
});
```

Next, you can add a simple connector which passes the configuration and query from the client to the server.

```js
class CustomConnector {
  constructor(host) {
    this.host = host;
  }

  async onSearch(query, options) {
    const response = await fetch(this.host + "/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        options
      })
    });
    return response.json();
  }

  async onAutocomplete(query, options) {
    const response = await fetch(this.host + "/autocomplete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query,
        options
      })
    });
    return response.json();
  }
}

const connector = new CustomConnector("https://my-api-host/");

const config = {
  alwaysSearchOnInitialLoad: true,
  apiConnector: connector
  // ... typical search-ui configuration
};
```

Thats it!. You should see the `CustomConnector` executing requests to the server, providing the search state and configuration in the body. The node.js server will use the Elasticsearch connector to perform a search to Elasticsearch and return the results back to the client.

## Customise the Elasticsearch Request Body [api-connectors-elasticsearch-customise-the-elasticsearch-request-body]

Elasticsearch connector allows you to customise the Elasticsearch request body before its performed on Elasticsearch. This is useful if you want to customise the query or options before the request is sent to Elasticsearch.

This is an advanced option, the underlying query may change between versions and reading from / mutating the query is brittle, so please be aware to use this sparingly and let us know what you want to achieve through github issues.

Example below is overriding the `query` section of the Elasticsearch request body.

```js
const connector = new ElasticsearchAPIConnector(
  {
    host: "https://example-host.es.us-central1.gcp.cloud.es.io:9243",
    index: "national-parks",
    apiKey: "exampleApiKey"
  },
  (requestBody, requestState, queryConfig) => {
    console.log("postProcess requestBody Call", requestBody); // logging out the requestBody before sending to Elasticsearch
    if (!requestState.searchTerm) return requestBody;

    // transforming the query before sending to Elasticsearch using the requestState and queryConfig
    const searchFields = queryConfig.search_fields;

    requestBody.query = {
      multi_match: {
        query: requestState.searchTerm,
        fields: Object.keys(searchFields).map((fieldName) => {
          const weight = searchFields[fieldName].weight || 1;
          return `${fieldName}^${weight}`;
        })
      }
    };

    return requestBody;
  }
);
```
