import { setupDriver, mockPlugin, SubjectArguments } from "../../test/helpers";
import {
  itResetsCurrent,
  itFetchesResults,
  itUpdatesURLState
} from "../../test/sharedTests";
import { RequestState } from "../../types";

// We mock this so no state is actually written to the URL
jest.mock("../../URLManager");
import URLManager from "../../URLManager";
const MockedURLManager = jest.mocked(URLManager, true);

describe("#setFilter", () => {
  beforeEach(() => {
    MockedURLManager.mockClear();
    jest.clearAllMocks();
  });

  function subject(
    {
      name,
      value,
      type,
      persistent
    }: { name?; value?; type?; persistent?: boolean },
    {
      initialFilters = [],
      initialState = {
        filters: initialFilters
      }
    }: SubjectArguments = {}
  ) {
    const { driver, updatedStateAfterAction } = setupDriver({
      initialState
    });

    driver.setFilter(name, value, type, persistent);
    jest.runAllTimers();
    return updatedStateAfterAction.state;
  }

  itUpdatesURLState(URLManager, () => {
    subject({ name: 2 });
  });

  itFetchesResults(() => subject({ name: "field", value: "value" }));

  itResetsCurrent(() =>
    subject(
      { name: "field", value: "value", type: undefined },
      { initialState: { current: 2 } }
    )
  );

  it("Does not update other Search Parameter values", () => {
    const initialState: RequestState = {
      resultsPerPage: 60,
      sortField: "name",
      sortDirection: "asc",
      sortList: [
        { direction: "asc", field: "name" },
        { direction: "desc", field: "title" }
      ],
      searchTerm: "test"
    };
    const { resultsPerPage, sortField, sortDirection, sortList, searchTerm } =
      subject(
        { name: "field", value: "value", type: undefined },
        { initialState }
      );
    expect({
      resultsPerPage,
      sortField,
      sortDirection,
      sortList,
      searchTerm
    }).toEqual(initialState);

    expect(mockPlugin.subscribe).toHaveBeenCalledWith({
      field: "field",
      value: "value",
      query: "test",
      type: "FacetFilterSelected"
    });
  });

  it("Adds a new filter and removes old filters", () => {
    expect(
      subject(
        { name: "test", value: "value2", type: undefined },
        {
          initialFilters: [
            { field: "initial", values: ["value"], type: "all" },
            { field: "test", values: ["value1"], type: "all" }
          ]
        }
      ).filters
    ).toEqual([
      { field: "initial", values: ["value"], type: "all" },
      { field: "test", values: ["value2"], type: "all" }
    ]);
    expect(mockPlugin.subscribe).toHaveBeenCalledWith({
      field: "test",
      value: "value2",
      query: "",
      type: "FacetFilterSelected"
    });
  });

  it("Adds an 'any' type filter", () => {
    expect(
      subject({ name: "test", value: "value", type: "any" }).filters
    ).toEqual([{ field: "test", values: ["value"], type: "any" }]);
    expect(mockPlugin.subscribe).toHaveBeenCalledWith({
      field: "test",
      value: "value",
      query: "",
      type: "FacetFilterSelected"
    });
  });

  it("Adds a 'none' type filter", () => {
    expect(
      subject({ name: "test", value: "value", type: "none" }).filters
    ).toEqual([{ field: "test", values: ["value"], type: "none" }]);
    expect(mockPlugin.subscribe).toHaveBeenCalledWith({
      field: "test",
      value: "value",
      query: "",
      type: "FacetFilterSelected"
    });
  });

  it("Adds an 'array' type filter properly", () => {
    expect(
      subject({ name: "test", value: ["value", "value2"], type: "none" })
        .filters
    ).toEqual([{ field: "test", values: ["value", "value2"], type: "none" }]);
    expect(mockPlugin.subscribe).toHaveBeenCalledWith({
      field: "test",
      value: "value,value2",
      query: "",
      type: "FacetFilterSelected"
    });
  });

  it("Will maintain separate Filter structures for different filter types", () => {
    expect(
      subject(
        { name: "test", value: "value", type: "any" },
        {
          initialFilters: [{ field: "test", values: ["value"], type: "all" }]
        }
      ).filters
    ).toEqual([
      { field: "test", values: ["value"], type: "all" },
      { field: "test", values: ["value"], type: "any" }
    ]);
  });

  it("Will remove the correct typed filter", () => {
    expect(
      subject(
        { name: "test", value: "value1", type: "any" },
        {
          initialFilters: [
            { field: "test", values: ["value"], type: "all" },
            { field: "test", values: ["value"], type: "any" },
            { field: "test", values: ["value"], type: "none" }
          ]
        }
      ).filters
    ).toEqual([
      { field: "test", values: ["value"], type: "all" },
      { field: "test", values: ["value"], type: "none" },
      { field: "test", values: ["value1"], type: "any" }
    ]);
  });

  it("Will add a persistent filter", () => {
    expect(
      subject(
        { name: "test", value: "value", type: "all", persistent: true },
        {
          initialFilters: [{ field: "test", values: ["value"], type: "all" }]
        }
      ).filters
    ).toEqual([
      { field: "test", values: ["value"], type: "all", persistent: true }
    ]);
  });
});
