// Aggregation.test.ts

import { AggregateOptions, JsonCollection } from "../src";

describe("Aggregation", () => {
  const data = [
    { id: 1, name: "Alice", age: 30 },
    { id: 2, name: "Bob", age: 25 },
    { id: 3, name: "Charlie", age: 35 },
    { id: 4, name: "David", age: 40 },
  ];

  it("should filter data based on $match option", () => {
    const options: AggregateOptions = { $match: { age: { $gt: 30 } } };
    const collection = new JsonCollection(data);
    const filteredData = collection.aggregate(options);
    expect(filteredData).toEqual([
      { id: 3, name: "Charlie", age: 35 },
      { id: 4, name: "David", age: 40 },
    ]);
  });

  it("should group and aggregate data based on $group option with count", () => {
    const options: AggregateOptions = {
      $group: { _id: "$age", count: { $sum: 1 } },
    };
    const collection = new JsonCollection(data);
    const groupedData = collection.aggregate(options);
    const sortedGroupedData = groupedData.sort((a, b) => a._id - b._id);

    expect(sortedGroupedData).toEqual([
      { _id: 25, count: 1 },
      { _id: 30, count: 1 },
      { _id: 35, count: 1 },
      { _id: 40, count: 1 },
    ]);
  });

  it("should sort data based on $sort option", () => {
    const options: AggregateOptions = { $sort: { age: 1 } };
    const collection = new JsonCollection(data);
    const sortedData = collection.aggregate(options);

    expect(sortedData).toEqual([
      { id: 2, name: "Bob", age: 25 },
      { id: 1, name: "Alice", age: 30 },
      { id: 3, name: "Charlie", age: 35 },
      { id: 4, name: "David", age: 40 },
    ]);
  });

  it("should limit data based on $limit option", () => {
    const options: AggregateOptions = { $limit: 2 };
    const collection = new JsonCollection(data);
    const limitedData = collection.aggregate(options);

    expect(limitedData.length).toBe(2);
  });

  it("should perform aggregation with $sum option", () => {
    const options: AggregateOptions = {
      $group: { _id: null, totalAge: { $sum: "$age" } },
    };
    const collection = new JsonCollection(data);
    const aggregatedData = collection.aggregate(options);

    expect(aggregatedData).toEqual([{ _id: null, totalAge: 130 }]);
  });

  it("should perform aggregation with $min option", () => {
    const options: AggregateOptions = {
      $group: { _id: null, minAge: { $min: "$age" } },
    };
    const collection = new JsonCollection(data);
    const aggregatedData = collection.aggregate(options);
    expect(aggregatedData).toEqual([{ _id: null, minAge: 25 }]);
  });

  it("should perform aggregation with $max option", () => {
    const options: AggregateOptions = {
      $group: { _id: null, maxAge: { $max: "$age" } },
    };
    const collection = new JsonCollection(data);
    const aggregatedData = collection.aggregate(options);

    expect(aggregatedData).toEqual([{ _id: null, maxAge: 40 }]);
  });

  it("should perform aggregation with $median option", () => {
    const options: AggregateOptions = {
      $group: { _id: null, medianAge: { $median: "$age" } },
    };
    const collection = new JsonCollection(data);
    const aggregatedData = collection.aggregate(options);

    expect(aggregatedData).toEqual([{ _id: null, medianAge: 32.5 }]);
  });

  it("should perform aggregation with $stdDevPop option", () => {
    const options: AggregateOptions = {
      $group: { _id: null, stdDevPopAge: { $stdDevPop: "$age" } },
    };
    const collection = new JsonCollection(data);
    const aggregatedData = collection.aggregate(options);

    expect(aggregatedData).toEqual([
      { _id: null, stdDevPopAge: 5.5901699437494745 },
    ]);
  });

  it("should perform aggregation with $stdDevSamp option", () => {
    const options: AggregateOptions = {
      $group: { _id: null, stdDevSampAge: { $stdDevSamp: "$age" } },
    };
    const collection = new JsonCollection(data);
    const aggregatedData = collection.aggregate(options);

    expect(aggregatedData).toEqual([
      { _id: null, stdDevSampAge: 6.454972243679028 },
    ]);
  });
});

describe("Complex Aggregation", () => {
  const data = [
    { id: 1, name: "Alice", age: 30 },
    { id: 2, name: "Bob", age: 25 },
    { id: 3, name: "Charlie", age: 35 },
    { id: 4, name: "David", age: 40 },
  ];

  it("should filter, group, sort, and limit data simultaneously", () => {
    const options: AggregateOptions = {
      $match: { age: { $gt: 30 } },
      $group: { _id: "$age", count: { $sum: 1 } },
      $sort: { _id: 1 },
      $limit: 2,
    };

    const collection = new JsonCollection(data);
    const result = collection.aggregate(options);

    expect(result).toEqual([
      { _id: 35, count: 1 },
      { _id: 40, count: 1 },
    ]);
  });
});

describe("Complex Aggregation with Min and Max", () => {
  const data = [
    { id: 1, name: "Alice", age: 30 },
    { id: 2, name: "Bob", age: 25 },
    { id: 3, name: "Charlie", age: 35 },
    { id: 4, name: "David", age: 40 },
  ];

  it("should filter, group, and find min and max age", () => {
    const options: AggregateOptions = {
      $match: { age: { $gt: 30 } },
      $group: { _id: null, minAge: { $min: "$age" }, maxAge: { $max: "$age" } },
    };

    const collection = new JsonCollection(data);
    const result = collection.aggregate(options);

    expect(result).toEqual([{ _id: null, minAge: 35, maxAge: 40 }]);
  });
});
