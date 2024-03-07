// Find.test.ts
import { find, FindOptions } from "../src";

// 테스트할 데이터 배열
const testData = [
  { _id: 1, name: "John", age: 30 },
  { _id: 2, name: "Alice", age: 25 },
  { _id: 3, name: "Bob", age: 35 },
];

describe("find", () => {
  it("should return all documents if no options are provided", () => {
    const result = find(testData, {});
    expect(result).toEqual(testData);
  });

  it("should filter documents based on $match option", () => {
    const options: FindOptions = { $match: { age: { $gte: 30 } } };
    const expectedResult = [
      { _id: 1, name: "John", age: 30 },
      { _id: 3, name: "Bob", age: 35 },
    ];
    const result = find(testData, options);
    expect(result).toEqual(expectedResult);
  });

  it("should sort documents based on $sort option", () => {
    const options: FindOptions = { $sort: { age: 1 } };
    const expectedResult = [
      { _id: 2, name: "Alice", age: 25 },
      { _id: 1, name: "John", age: 30 },
      { _id: 3, name: "Bob", age: 35 },
    ];
    const result = find(testData, options);
    expect(result).toEqual(expectedResult);
  });

  it("should limit the number of documents based on $limit option", () => {
    const options: FindOptions = { $limit: 2 };
    const expectedResult = [
      { _id: 1, name: "John", age: 30 },
      { _id: 2, name: "Alice", age: 25 },
    ];
    const result = find(testData, options);
    expect(result).toEqual(expectedResult);
  });

  it("should handle multiple options together", () => {
    const options: FindOptions = {
      $match: { age: { $gte: 30 } },
      $sort: { age: -1 },
      $limit: 1,
    };

    const expectedResult = [{ _id: 3, name: "Bob", age: 35 }];
    const result = find(testData, options);
    expect(result).toEqual(expectedResult);
  });
});
