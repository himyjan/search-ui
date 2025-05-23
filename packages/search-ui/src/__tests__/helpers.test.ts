import { helpers } from "..";
import { isFilterValueRange } from "../helpers";
import { Filter } from "../types";
const doFilterValuesMatch = helpers.doFilterValuesMatch;
const markSelectedFacetValuesFromFilters =
  helpers.markSelectedFacetValuesFromFilters;
const mergeFilters = helpers.mergeFilters;
const getFilterBooleanValue = helpers.getFilterBooleanValue;

describe("doFilterValuesMatch", () => {
  describe("when matching simple values", () => {
    it("will match string", () => {
      expect(doFilterValuesMatch("filterValue", "filterValue")).toBe(true);
    });

    it("will not match different string", () => {
      expect(doFilterValuesMatch("filterValue", "filterValue1")).toBe(false);
    });

    it("will match number", () => {
      expect(doFilterValuesMatch(1, 1)).toBe(true);
    });

    it("will not match different number", () => {
      expect(doFilterValuesMatch(1, 2)).toBe(false);
    });
  });

  describe("when matching falsey values", () => {
    it("will match empty string", () => {
      expect(doFilterValuesMatch("", "")).toBe(true);
    });

    it("will match 0", () => {
      expect(doFilterValuesMatch(0, 0)).toBe(true);
    });

    it("will match null", () => {
      expect(doFilterValuesMatch(null, null)).toBe(true);
    });

    it("will match undefined", () => {
      expect(doFilterValuesMatch(undefined, undefined)).toBe(true);
    });

    it("will not match different falsey values - 0 and ''", () => {
      expect(doFilterValuesMatch(0, "")).toBe(false);
    });
  });

  describe("when matching object based filter values", () => {
    it("will match objects", () => {
      const filterValue1 = { from: 1, to: 10 };
      const filterValue2 = { from: 1, to: 10 };
      expect(doFilterValuesMatch(filterValue1, filterValue2)).toBe(true);
    });

    it("will not match objects if they are different", () => {
      const filterValue1 = { from: 1, to: 10 };
      const filterValue2 = { from: 1, to: 12 };
      expect(doFilterValuesMatch(filterValue1, filterValue2)).toBe(false);
    });

    it("will not match objects if leafs are falsey matches", () => {
      const filterValue1 = { from: 1, to: 0 };
      const filterValue2 = { from: 1, to: "" };
      expect(doFilterValuesMatch(filterValue1, filterValue2)).toBe(false);
    });

    it("will not match objects through coercion", () => {
      const filterValue1 = { from: 1, to: 0 };
      const filterValue2 = { from: 1, to: "0" };
      expect(doFilterValuesMatch(filterValue1, filterValue2)).toBe(false);
    });

    it("will match objects with differently ordered props", () => {
      const filterValue1 = { to: 10, from: 1 };
      const filterValue2 = { from: 1, to: 10 };
      expect(doFilterValuesMatch(filterValue1, filterValue2)).toBe(true);
    });

    it("will do a short-circuit match if 'name' matches", () => {
      const filterValue1 = { name: "The first option" };
      const filterValue2 = { from: 1, to: 10, name: "The first option" };
      expect(doFilterValuesMatch(filterValue1, filterValue2)).toBe(true);
    });

    it("will do a short-circuit match if 'name' matches as well as attributes", () => {
      const filterValue1 = { from: 1, to: 10, name: "The first option" };
      const filterValue2 = { from: 1, to: 10, name: "The first option" };
      expect(doFilterValuesMatch(filterValue1, filterValue2)).toBe(true);
    });

    it("will not do a short-circuit match if 'name' doesn't matches", () => {
      const filterValue1 = { name: "The first option" };
      const filterValue2 = { from: 1, to: 10, name: "The second option" };
      expect(doFilterValuesMatch(filterValue1, filterValue2)).toBe(false);
    });

    it("will not do a short-circuit match if 'name' isn't present", () => {
      const filterValue1 = { from: 1 };
      const filterValue2 = { from: 1, to: 10 };
      expect(doFilterValuesMatch(filterValue1, filterValue2)).toBe(false);
    });

    it("will match empty objects", () => {
      const filterValue1 = {};
      const filterValue2 = {};
      expect(doFilterValuesMatch(filterValue1, filterValue2)).toBe(true);
    });
  });

  describe("when matching boolean values", () => {
    it("will match string 'true' with boolean true", () => {
      expect(doFilterValuesMatch("true", true)).toBe(true);
    });

    it("will match numeric 1 with boolean true", () => {
      expect(doFilterValuesMatch(1, "true")).toBe(true);
    });

    it("will not match string true with numeric 0", () => {
      expect(doFilterValuesMatch("true", 0)).toBe(false);
    });
  });
});

describe("markSelectedFacetValuesFromFilters", () => {
  const facet = {
    field: "states",
    type: "value",
    data: [
      {
        count: 9,
        value: "California"
      },
      {
        count: 8,
        value: "Alaska"
      },
      {
        count: 1,
        value: "South Carolina"
      },
      {
        count: 1,
        value: "Tennessee"
      }
    ]
  };

  const filters: Filter[] = [
    {
      field: "states",
      values: ["California", "South Carolina"],
      type: "any"
    },
    {
      field: "states",
      values: ["Alaska"],
      type: "all"
    },
    {
      field: "world_heritage_site",
      values: ["true"],
      type: "all"
    }
  ];

  it("will mark selected facets as selected based on current filters, field name, and filter type", () => {
    const marked = markSelectedFacetValuesFromFilters(
      facet,
      filters,
      "states",
      "any"
    );
    expect(marked).toEqual({
      field: "states",
      type: "value",
      data: [
        {
          count: 9,
          value: "California",
          selected: true
        },
        {
          count: 8,
          value: "Alaska",
          selected: false
        },
        {
          count: 1,
          value: "South Carolina",
          selected: true
        },
        {
          count: 1,
          value: "Tennessee",
          selected: false
        }
      ]
    });
  });
});

describe("mergeFilters", () => {
  const filters1 = [
    { field: "world_heritage_site", values: ["false"], type: "any" },
    { field: "world_heritage_site", values: ["false"], type: "all" },
    { field: "states", values: ["Arizona", "Wyoming"], type: "all" }
  ];
  const filters2 = [
    { field: "world_heritage_site", values: ["true"], type: "all" },
    { field: "states", values: ["Washington"], type: "all" },
    { field: "acres", values: 1, type: "any" }
  ];

  function subject() {
    return mergeFilters(filters1, filters2);
  }

  it("will keep two values on the same field with different types", () => {
    expect(subject()).toContainEqual({
      field: "world_heritage_site",
      values: ["false"],
      type: "any" // different
    });
    expect(subject()).toContainEqual({
      field: "world_heritage_site",
      values: ["false"],
      type: "all" // different
    });
  });

  it("will override a value from the first array on the same field and type", () => {
    // This is the value from filters2, which should be used
    expect(subject()).toContainEqual(filters1[1]);
    // This is defined in filters1 with the same type and field, so it's not used
    expect(subject()).not.toContainEqual(filters2[0]);
  });

  it("will keep values defined in one array or the other", () => {
    expect(subject()).toContainEqual(filters1[2]);
    expect(subject()).toContainEqual(filters2[2]);
  });

  describe("isFilterValueRange", () => {
    it("will return true if the filter value is a range", () => {
      const filterValue = { from: 1, to: 10, name: "The first option" };
      expect(isFilterValueRange(filterValue)).toBe(true);
    });

    it("will return false if the filter value is not a range", () => {
      expect(isFilterValueRange(1)).toBe(false);
      expect(isFilterValueRange("1")).toBe(false);
    });
  });
});

describe("getFilterBooleanValue", () => {
  it("handles string values", () => {
    expect(getFilterBooleanValue("true")).toBe(true);
    expect(getFilterBooleanValue("false")).toBe(false);
    expect(getFilterBooleanValue("1")).toBe(false);
    expect(getFilterBooleanValue("0")).toBe(false);
  });

  it("handles numeric values", () => {
    expect(getFilterBooleanValue(1)).toBe(true);
    expect(getFilterBooleanValue(0)).toBe(false);
  });

  it("handles actual boolean values", () => {
    expect(getFilterBooleanValue(true)).toBe(true);
    expect(getFilterBooleanValue(false)).toBe(false);
  });

  it("handles edge cases", () => {
    expect(getFilterBooleanValue("")).toBe(false);
    expect(getFilterBooleanValue(null)).toBe(false);
    expect(getFilterBooleanValue(undefined)).toBe(false);
  });
});
