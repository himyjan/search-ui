---
mapped_pages:
  - https://www.elastic.co/guide/en/search-ui/current/api-connectors-site-search.html
applies_to:
  stack:
  serverless:
---

# Site Search Connector [api-connectors-site-search]

This Connector is used to connect Search UI to Elastic’s [Site Search](https://www.elastic.co/cloud/site-search-service) API.

While Site Search supports multiple document types, Search UI will only support a single document type, and it must be provided up front when creating the connector.

Note that Site Search does not support certain features of Search UI:

- `disjunctiveFacets` or `disjunctiveFacetsAnalyticsTags` configuration options
- Only `value` facets are allowed, no `range` facet support.
- `sort` option is not supported on facets.
- `size` option is not supported on facets.
- Does not support multiple filters applied to a single field.
- Cannot apply more than 1 range filter on a single field.
- Analytics tags are not supported in `click`.
- `suggestions` are not supported in autocomplete, only `results`
- The `none` filter type is not supported.

## Usage [api-connectors-site-search-usage]

```shell
npm install --save @elastic/search-ui-site-search-connector
```

```js
import SiteSearchAPIConnector from "@elastic/search-ui-site-search-connector";

const connector = new SiteSearchAPIConnector({
  documentType: "national-parks",
  engineKey: "Z41R5U3Hi4s5gp1aw7kA"
});
```

| Param                         | Description                                                                                                                      |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| documentType                  | Required. String type. Document Type found in your Site Search Dashboard                                                         |
| engineKey                     | Required. String type. Credential found in your Site Search Dashboard                                                            |
| beforeSearchCall              | Optional. A hook to amend query options before the request is sent to the API in a query on an "onSearch" event.                 |
| beforeAutocompleteResultsCall | Optional. A hook to amend query options before the request is sent to the API in a "results" query on an "onAutocomplete" event. |
