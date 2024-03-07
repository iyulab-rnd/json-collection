# json-collection

This library provides a simplified simulation of MongoDB's aggregation and query framework in TypeScript. It enables filtering, grouping, sorting, and limiting of in-memory data collections, mimicking the behavior of MongoDB database operations but in a lightweight, local context.

## Installation

To use the Json Collection library in your project, install it via npm. Execute the following command in your project directory:

```bash
npm install @iyulab/json-collection
```

Make sure you have Node.js and npm installed on your system. You can download and install Node.js (npm included) from https://nodejs.org/.

## Features

The Json Collecgtion library provides the following features:

- Filtering ($match): Filter your data based on specified criteria.
- Grouping and Aggregation ($group): Group your data by specific fields and perform various aggregation operations like counting, summing, averaging, etc.
- Sorting ($sort): Sort your data based on one or more fields.
- Limiting ($limit): Limit the number of documents to return.
- Finding ($find): Retrieve documents from your data based on filtering, sorting, and limiting criteria, simulating the MongoDB find operation.

## Usage

Below is a simple example demonstrating how to use the Json Collection library to perform data operations:

```typescript
import {
  aggregate,
  find,
  AggregationOptions,
  FindOptions,
} from "@iyulab/json-collection";

// Sample data
const data = [
  { id: 1, name: "Alice", age: 30 },
  { id: 2, name: "Bob", age: 25 },
  { id: 3, name: "Charlie", age: 35 },
  { id: 4, name: "David", age: 40 },
];

// Aggregation example
const aggOptions: AggregationOptions = {
  $match: { age: { $gt: 30 } }, // Filtering: age greater than 30
  $group: { _id: "$age" }, // Grouping by age
  $sort: { age: 1 }, // Sorting by age in ascending order
  $limit: 2, // Limiting to 2 documents
};

const aggResult = aggregate(data, aggOptions);
console.log(aggResult);

// Find example
const findOptions: FindOptions = {
  $match: { name: { $eq: "Alice" } }, // Filtering: name equals Alice
  $sort: { age: -1 }, // Sorting by age in descending order
  $limit: 1, // Limiting to 1 document
};

const findResult = find(data, findOptions);
console.log(findResult);
```

This will output the processed data based on the provided aggregation options.

- See [Find Tests](./tests/Find.test.ts)
- See [Aggregate Tests](./tests/Aggregate.test.ts)

## Contribution

Contributions are welcome! Please feel free to submit pull requests or open issues to improve the library or add new features.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.
