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
  $sort?: { [key: string]: 1 | -1 } | { [key: number]: 1 | -1 };
  $limit?: number;
}

// MongoDB 집계를 실행하는 함수
export function aggregate(
  data: any[],
  options: AggregateOptions[] | AggregateOptions
): any[] {
  let result = data;

  if (Array.isArray(options)) {
    options.forEach((option) => {
      result = applyOption(result, option);
    });
  } else {
    result = applyOption(result, options);
  }

  return result;
}

// 단일 옵션을 적용하는 함수
function applyOption(data: any[], option: AggregateOptions): any[] {
  // $match 옵션 처리
  if (option.$match) {
    data = data.filter((item) => matchFilter(item, option.$match));
  }

  // $group 옵션 처리
  if (option.$group) {
    const resultsMap = initializeAggregationResults(option.$group);
    performAggregation(data, option.$group, resultsMap);
    data = finalizeAggregationResults(resultsMap, option.$group);
  }

  // $sort 옵션 처리
  if (option.$sort) {
    data = data.sort((a, b) => compare(a, b, option.$sort));
  }

  // $limit 옵션 처리
  if (option.$limit) {
    data = data.slice(0, option.$limit);
  }

  return data;
}
