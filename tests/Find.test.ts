// Find.test.ts
import { JsonCollection, FindOptions, SortOption } from "../src";

const testData = [
  { _id: 1, name: "John", age: 30 },
  { _id: 2, name: "Alice", age: 25 },
  { _id: 3, name: "Bob", age: 35 },
];

describe("find", () => {
  it("should return all documents if no options are provided", () => {
    const collection = new JsonCollection(testData);
    const result = collection.find().toArray();
    expect(result).toEqual(testData);
  });

  it("should filter documents based on options", () => {
    const options: FindOptions = { age: { $gte: 30 } };
    const expectedResult = [
      { _id: 1, name: "John", age: 30 },
      { _id: 3, name: "Bob", age: 35 },
    ];
    const collection = new JsonCollection(testData);
    const result = collection.find(options).toArray();
    expect(result).toEqual(expectedResult);
  });

  it("should sort and limit documents based on options", () => {
    const sortOptions: SortOption = { age: 1 }; // 나이에 따라 오름차순으로 정렬
    const limitNumber = 2; // 결과를 2개로 제한
    const expectedResult = [
      { _id: 2, name: "Alice", age: 25 },
      { _id: 1, name: "John", age: 30 },
    ];
    const collection = new JsonCollection(testData);
    const result = collection
      .find()
      .sort(sortOptions)
      .limit(limitNumber)
      .toArray();
    expect(result).toEqual(expectedResult);
  });
});
