// src/Aggregate.ts
// mongodb 의 db.collection.aggregate({?}) 문법을 모방한 구현입니다.
import {
  compare,
  matchFilter,
  performAggregation,
  initializeAggregationResults,
  finalizeAggregationResults,
} from "./Functions";

export interface AggregateOptions {
  $match?: any;
  $group?: { [key: string]: any };
  $sort?: { [key: string]: 1 | -1 };
  $limit?: number;
}

// MongoDB 집계를 실행하는 함수
export function aggregate(data: any[], options: AggregateOptions): any[] {
  let result = data;

  if (options.$match) {
    result = result.filter((item) => matchFilter(item, options.$match));
  }

  if (options.$group) {
    const resultsMap = initializeAggregationResults(options.$group);
    performAggregation(result, options.$group, resultsMap);
    result = finalizeAggregationResults(resultsMap, options.$group);
  }

  if (options.$sort) {
    result = result.sort((a, b) => compare(a, b, options.$sort));
  }

  if (options.$limit) {
    result = result.slice(0, options.$limit);
  }

  return result;
}
