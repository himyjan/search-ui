---
mapped_pages:
  - https://www.elastic.co/guide/en/search-ui/current/guides-changing-component-behavior.html
applies_to:
  stack:
  serverless:
---

# Changing component behavior [guides-changing-component-behavior]

We have two primary recommendations for customizing Component behavior:

1. Override state and action props before they are passed to your Component, using the `mapContextToProps` param. This will override the default `mapContextToProps` for the component.
2. Override props before they are passed to your Component’s view.

## Override mapContextToProps [guides-changing-component-behavior-override-mapcontexttoprops]

Every Component supports a `mapContextToProps` prop, which allows you to modify state and actions before they are received by the Component.

::::{note}
This MUST be an immutable function. If you directly update the props or context, you will have major issues in your application.
::::

A practical example might be putting a custom sort on your facet data.

This example orders a list of states by name:

```jsx
<Facet
  mapContextToProps={(context) => {
    if (!context.facets.states) return context;
    return {
      ...context,
      facets: {
        ...(context.facets || {}),
        states: context.facets.states.map((s) => ({
          ...s,
          data: s.data.sort((a, b) => {
            if (a.value > b.value) return 1;
            if (a.value < b.value) return -1;
            return 0;
          })
        }))
      }
    };
  }}
  field="states"
  label="States"
  show={10}
/>
```

## Overriding view props [guides-changing-component-behavior-overriding-view-props]

An example of this is modifying the `onChange` handler of the `Paging` Component view. Hypothetically, you may need to know every time a user pages past page 1, indicating that they are not finding what they need on the first page of search results.

```jsx
import { Paging } from "@elastic/react-search-ui";
import { Paging as PagingView } from "@elastic/react-search-ui-views";

function reportChange(value) {
  // Some logic to report the change
}

<Paging
  view={(props) =>
    PagingView({
      ...props,
      onChange: (value) => {
        reportChange(value);
        return props.onChange(value);
      }
    })
  }
/>;
```

In this example, we did the following:

1. Looked up what the default view is for our Component in the components guide.
2. Imported that view as `PagingView`.
3. Passed an explicit `view` to our `Paging` Component, overriding the `onChange` prop with our own implementation, and ultimately rendering `PagingView` with the updated props.
