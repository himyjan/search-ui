---
navigation_title: "React components"
mapped_pages:
  - https://www.elastic.co/guide/en/search-ui/current/api-react-components-search-box.html
applies_to:
  stack:
  serverless:
---

# SearchBox [api-react-components-search-box]

Input element which accepts search terms and triggers a new search query.

## Example [api-react-components-search-box-example]

```jsx
import { SearchBox } from "@elastic/react-search-ui";

...

<SearchBox />
```

## Configuring search queries [api-react-components-search-box-configuring-search-queries]

The input from `SearchBox` will be used to trigger a new search query. That query can be further customized in the `SearchProvider` configuration, using the `searchQuery` property. See the [Search Query Configuration](/reference/api-core-configuration.md#api-core-configuration-search-query-queryconfig) guide for more information.

## Example of passing custom props to text input element [api-react-components-search-box-example-of-passing-custom-props-to-text-input-element]

```jsx
<SearchBox inputProps={{ placeholder: "custom placeholder" }} />
```

## Example using autocomplete results [api-react-components-search-box-example-using-autocomplete-results]

"Results" are search results. The default behavior for autocomplete results is to link the user directly to a result when selected, which is why a "titleField" and "urlField" are required for the default view.

```jsx
<SearchBox
  autocompleteResults={{
    titleField: "title",
    urlField: "nps_link"
  }}
/>
```

## Example using autocomplete suggestions [api-react-components-search-box-example-using-autocomplete-suggestions]

"Suggestions" are different than "results". Suggestions are suggested queries. Unlike an autocomplete result, a suggestion does not go straight to a result page when selected. It acts as a regular search query and refreshes the result set.

```jsx
<SearchBox autocompleteSuggestions={true} />
```

## Example using autocomplete suggestions and autocomplete results [api-react-components-search-box-example-using-autocomplete-suggestions-and-autocomplete-results]

The default view will show both results and suggestions, divided into sections. Section titles can be added to help distinguish between the two.

```jsx
<SearchBox
  autocompleteResults={{
    sectionTitle: "Suggested Results",
    titleField: "title",
    urlField: "nps_link"
  }}
  autocompleteSuggestions={{
    sectionTitle: "Suggested Queries"
  }}
/>
```

## Example retrieving suggestions from another index [api-react-components-search-box-example-retrieving-suggestions-from-another-index]

::::{important}
**Supported only by the Elasticsearch-connector.**

::::

A different index can be used for the suggestions. Some examples:

- Popular queries index from analytics
- Brands index from product data
- Categories index from product data

Below we are using the `popular_queries` index and performing a prefix match search on the `query.suggest` field. One thing to note, make sure the api-key has access to the index.

### Autocomplete Configuration [api-react-components-search-box-autocomplete-configuration]

```jsx
autocompleteQuery: {
  suggestions: {
    types: {
      popularQueries: {
        search_fields: {
          "query.suggest": {} // fields used to query
        },
        result_fields: {
          query: { // fields used for display
            raw: {}
          }
        },
        index: "popular_queries",
        queryType: "results"
      }
    },
    size: 4
  }
}
```

### Component Configuration [api-react-components-search-box-component-configuration]

```jsx
<SearchBox
  autocompleteSuggestions={{
    popularQueries: {
      queryType: "results",
      displayField: "query" // specify which field used to display the suggestion
    },
    }
  }}
/>
```

You also have the option to customise the `view` of the autocomplete to show more fields.

## Configuring autocomplete queries [api-react-components-search-box-configuring-autocomplete-queries]

Autocomplete queries can be customized in the `SearchProvider` configuration, using the `autocompleteQuery` property. See the [Autocomplete Query Configuration](/reference/api-core-configuration.md) for more information.

```jsx
<SearchProvider
    config={{
      ...
      autocompleteQuery: {
        // Customize the query for autocompleteResults
        results: {
          result_fields: {
            // Add snippet highlighting
            title: { snippet: { size: 100, fallback: true } },
            nps_link: { raw: {} }
          }
        },
        // Customize the query for autocompleteSuggestions
        suggestions: {
          types: {
            // Limit query to only suggest based on "title" field
            documents: { fields: ["title"] }
          },
          // Limit the number of suggestions returned from the server
          size: 4
        }
      }
    }}
>
    <SearchBox
      autocompleteResults={{
        sectionTitle: "Suggested Results",
        titleField: "title",
        urlField: "nps_link"
      }}
      autocompleteSuggestions={{
        sectionTitle: "Suggested Queries",
      }}
    />
</SearchProvider>
```

## Example using multiple types of autocomplete suggestions [api-react-components-search-box-example-using-multiple-types-of-autocomplete-suggestions]

"Suggestions" can be generated via multiple methods. They can be derived from common terms and phrases inside of documents, or be "popular" queries generated from actual search queries made by users. The example below shows how to configure multiple suggestion types using ElasticsearchConnector.

```jsx
<SearchProvider
    config={{
      ...
      autocompleteQuery: {
        suggestions: {
          types: {
            documents: { }, // Suggestions based on document content
            popular_queries: { } // Suggestions based on popular search queries
          }
        }
      }
    }}
>
    <SearchBox
      autocompleteSuggestions={{
        // Types used here need to match types requested from the server
        documents: {
          sectionTitle: "Suggested Queries",
        },
        popular_queries: {
          sectionTitle: "Popular Queries"
        }
      }}
    />
</SearchProvider>
```

## Example using autocomplete in a site header [api-react-components-search-box-example-using-autocomplete-in-a-site-header]

This is an example from a [Gatsby](https://www.gatsbyjs.org/) site, which overrides "submit" to navigate a user to the search page for suggestions, and maintaining the default behavior when selecting a result.

```jsx
<SearchBox
  autocompleteResults={{
    titleField: "title",
    urlField: "nps_link"
  }}
  autocompleteSuggestions={true}
  onSubmit={(searchTerm) => {
    navigate("/search?q=" + searchTerm);
  }}
  onSelectAutocomplete={(selection, {}, defaultOnSelectAutocomplete) => {
    if (selection.suggestion) {
      navigate("/search?q=" + selection.suggestion);
    } else {
      defaultOnSelectAutocomplete(selection);
    }
  }}
/>
```

## Properties [api-react-components-search-box-properties]

| Name                          | Description                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| className                     |                                                                                                                                                                                                                                                                                                                                                              |
| shouldClearFilters            | Should existing filters be cleared when a new search is performed?                                                                                                                                                                                                                                                                                           |
| inputProps                    | Props for underlying _input_ element. I.e., `{ placeholder: "Enter Text"}`.                                                                                                                                                                                                                                                                                  |
| searchAsYouType               | Executes a new search query with every key stroke. You can fine tune the number of queries made by adjusting the `debounceLength` parameter.                                                                                                                                                                                                                 |
| debounceLength                | When using `searchAsYouType`, it can be useful to "debounce" search requests to avoid creating an excessive number of requests. This controls the length to debounce / wait.                                                                                                                                                                                 |
| autocompleteResults           | Configure and autocomplete search results. Boolean option is primarily available for implementing custom views.                                                                                                                                                                                                                                              |
| autocompleteSuggestions       | Configure and autocomplete query suggestions. Boolean option is primarily available for implementing custom views. Configuration may or may not be keyed by "Suggestion Type", as APIs for suggestions may support may than 1 type of suggestion. If it is not keyed by Suggestion Type, then the configuration will be applied to the first type available. |
| autocompleteMinimumCharacters | Minimum number of characters before autocompleting.                                                                                                                                                                                                                                                                                                          |
| onSelectAutocomplete          | Allows overriding behavior when selected, to avoid creating an entirely new view. In addition to the current `selection`, various helpers are passed as `options` to the second parameter. This third parameter is the default `onSelectAutocomplete`, which allows you to defer to the original behavior.                                                   |
| onSubmit                      | Allows overriding behavior when submitted. Receives the search term from the search box.                                                                                                                                                                                                                                                                     |
| autocompleteView              | Used to override only the autocomplete dropdown. See [Autocomplete view customization](#api-react-components-search-box-autocomplete-view-customization) below.                                                                                                                                                                                              |
| inputView                     | Used to override only the input box. See [Input view customization](#api-react-components-search-box-input-view-customization) below.                                                                                                                                                                                                                        |
| view                          | Used to override the default view for this Component. See [Full view customization](#api-react-components-search-box-full-view-customization) below.                                                                                                                                                                                                         |
| \*                            | Any other property passed will be passed through and available to use in a Custom View                                                                                                                                                                                                                                                                       |

### AutocompleteResultsOptions [api-react-components-search-box-autocompleteresultsoptions]

| Name                    | Description                                               |
| ----------------------- | --------------------------------------------------------- |
| linkTarget              | Used to open links in a new tab.                          |
| sectionTitle            | Title to show in section within dropdown.                 |
| shouldTrackClickThrough | Only applies to Results, not Suggestions.                 |
| clickThroughTags        | Tags to send to analytics API when tracking clickthrough. |
| titleField              | Field within a Result to use as the "title".              |
| urlField                | Field within a Result to use for linking.                 |

### AutocompleteSuggestionsOptions [api-react-components-search-box-autocompletesuggestionsoptions]

| Name         | Description                              |
| ------------ | ---------------------------------------- |
| sectionTitle | Title to show in section within dropdown |

## View customization [api-react-components-search-box-view-customization]

A complete guide to view customization can be found in the [Customization: Component views and HTML](/reference/basic-usage.md#guides-customizing-styles-and-html-customizing-html) section.

### Full view customization [api-react-components-search-box-full-view-customization]

You can customize the entire view using the `view` prop. This is useful to use an entirely different autocomplete library (we use [downshift](https://github.com/downshift-js/downshift)). A SearchBox component at its simplest could look like the following:

```jsx
<SearchBox
  view={({ value, onChange, onSubmit }) => (
    <form onSubmit={onSubmit}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <input type="submit" value="Search" />
    </form>
  )}
/>
```

The full list of props available to this view are as follows:

| Name                          | Description                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| className                     | Passed through from main component.                                                                                                                                                                                                                                                                                                                                                                                 |
| inputView                     | Component to use for text input. When rendering, pass all props documented below in the [Input view customization](#api-react-components-search-box-input-view-customization) section.<br><br>Note that this can be challenging to do since some of the required props are generated by Downshift. It's generally advised not to try to use this property directly when creating a custom view.<br>                 |
| isFocused                     | Type: `boolean`. Whether or not the input currently has focus. Will only work if you have correct spread `inputProps` over your input box.                                                                                                                                                                                                                                                                          |
| onChange                      | Type: `(value: string) => void`. When a user changes the input of the search input box, call this with the new value.                                                                                                                                                                                                                                                                                               |
| onSubmit                      | Type: `(e: FormEvent) => void`. Handle a "submission" of the search box. Typically used directly on a `form` element surrounding your input box.                                                                                                                                                                                                                                                                    |
| value                         | Type: `string`. The current user input to show in the input box.                                                                                                                                                                                                                                                                                                                                                    |
| inputProps                    | An object containing props that should be spread over the input box element. You'll need to do this in order to have the `isFocused` prop work.                                                                                                                                                                                                                                                                     |
| autocompleteView              | Component to use for Autocomplete. When rendering, pass all props documented below in the [Autocomplete view customization](#api-react-components-search-box-autocomplete-view-customization) section.<br><br>Note that this can be challenging to do since some of the required props are generated by Downshift. It's generally advised not to try to use this property directly when creating a custom view.<br> |
| completeSuggestion            | Type: `(searchQuery: string) => void`.                                                                                                                                                                                                                                                                                                                                                                              |
| notifyAutocompleteSelected    | Type: `(selection: any) => void`.                                                                                                                                                                                                                                                                                                                                                                                   |
| autocompletedSuggestionsCount | Type: `number`.                                                                                                                                                                                                                                                                                                                                                                                                     |
| autocompleteSuggestions       | Type: `boolean &#124; AutocompleteSuggestion`.                                                                                                                                                                                                                                                                                                                                                                      |
| autocompletedSuggestions      | Type: `AutocompletedSuggestions`.                                                                                                                                                                                                                                                                                                                                                                                   |
| autocompletedResults          | Type: `AutocompletedResult[]`.                                                                                                                                                                                                                                                                                                                                                                                      |
| autocompleteResults           | Type: `AutocompleteResult &#124; boolean`.                                                                                                                                                                                                                                                                                                                                                                          |
| onSelectAutocomplete          | Type: `(selectedItem: any) => void`. Call this with the selected item (whether it is a result or a suggestion) when an autocomplete selection is made in the autocomplete dropdown.                                                                                                                                                                                                                                 |
| allAutocompletedItemsCount    | Type: `number`. The number of items that would be shown in an autocomplete. If 0, no need to show the autocomplete.                                                                                                                                                                                                                                                                                                 |
| useAutocomplete               | Type: `boolean`. Whether or not to show an autocomplete dropdown.                                                                                                                                                                                                                                                                                                                                                   |

See [SearchBox.tsx](https://github.com/elastic/search-ui/blob/main/packages/react-search-ui-views/src/SearchBox.tsx) for an example.

### Input view customization [api-react-components-search-box-input-view-customization]

For making small customizations, like simply hiding the search button, or rearranging DOM structure, full customization is often overkill.

You can also just customize the input section of the search box using the `inputView` prop.

```jsx
<SearchBox
  inputView={({ getAutocomplete, getInputProps, getButtonProps }) => (
    <>
      <div className="sui-search-box__wrapper">
        <input
          {...getInputProps({
            placeholder: "I am a custom placeholder"
          })}
        />
        {getAutocomplete()}
      </div>
      <input
        {...getButtonProps({
          "data-custom-attr": "some value"
        })}
      />
    </>
  )}
/>
```

Note that `getInputProps` and `getButtonProps` are [prop getters](https://kentcdodds.com/blog/how-to-give-rendering-control-to-users-with-prop-getters). They are meant return a props object to spread over their corresponding UI elements. This lets you arrange elements however you'd like in the DOM. It also lets you pass additional properties. You should pass properties through these functions, rather directly on elements, in order to not override base values. For instance, adding a `className` through these functions will assure that the className is only appended, not overriding the base class values.

`getAutocomplete` is used to determine where the autocomplete dropdown will be shown.

The full list of props available to this view are as follows:

| Name            | Description                                                                                                                                |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| getAutocomplete | Type: `() => JSX.Element`. Call this method wherever you would like your autocomplete to appear. Typically, directly below your input box. |
| getButtonProps  | Type: `() => Object`. Spread the return value of this function over your "Search" button, which submit your search.                        |
| getInputProps   | Type: `() => JSX`. Spread the return value of this function over the `input` element you are using for your search box.                    |

See [SearchInput.tsx](https://github.com/elastic/search-ui/blob/main/packages/react-search-ui-views/src/SearchInput.tsx) for an example.

### Autocomplete view customization [api-react-components-search-box-autocomplete-view-customization]

In addition to the `inputView` customization, you can also make targed customization to the autocomplete view using the `autocompleteView` prop.

For example:

```jsx
<SearchBox
  autocompleteView={({ autocompletedResults, getItemProps }) => (
    <div className="sui-search-box__autocomplete-container">
      {autocompletedResults.map((result, i) => (
        <div
          {...getItemProps({
            key: result.id.raw,
            item: result
          })}
        >
          Result {i}: {result.title.snippet}
        </div>
      ))}
    </div>
  )}
/>
```

The full list of props available to this view are as follows:

| Name                          | Description                                                                                                                                                                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| allAutocompletedItemsCount    | Type: `number`. The number of items that would be shown in an autocomplete. If 0, no need to show the autocomplete.                                                                 |
| autocompleteResults           | Type: `boolean &#124; AutocompleteResult`. Configuration object passed through from main component.                                                                                 |
| autocompletedResults          | Type: `AutocompletedResult[]`. The search results generated by an autocomplete query.                                                                                               |
| autocompletedSuggestions      | Type: `AutocompletedSuggestions`. The suggestions generated by an autocomplete suggestions query.                                                                                   |
| autocompletedSuggestionsCount | Type: `number`. The total number of suggestions generated by an autocomplete suggestions query.                                                                                     |
| autocompleteSuggestions       | Type: `boolean &#124; AutocompleteSuggestion`. Configuration object passed through from main component.                                                                             |
| onSelectAutocomplete          | Type: `(selectedItem: any) => void`. Call this with the selected item (whether it is a result or a suggestion) when an autocomplete selection is made in the autocomplete dropdown. |
| getItemProps                  | Type: `{ key: string, index: number, item: AutocompletedSuggestion }) => any`. A function that will generate props to spread over an individual item in the autocomplete list.      |
| getMenuProps                  | Type: `({ className: string }) => any`. A function that will generate props to spread over the main autocomplete dropdown element.                                                  |

See [Autocomplete.tsx](https://github.com/elastic/search-ui/blob/main/packages/react-search-ui-views/src/Autocomplete.tsx) for an example.
