// src/Aggregate.ts
// mongodb 의 db.collection.aggregate({?}) 문법을 모방한 구현입니다.
import { compare, compareValues, matchFilter } from "./Functions";
import * as math from "mathjs";
// import { List } from "immutable";
// import linq from "linq";
// import { MathNumericType } from "mathjs";

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
    result = groupAndAggregate(result, options.$group);
  }

  if (options.$sort) {
    result = result.sort((a, b) => compare(a, b, options.$sort));
  }

  if (options.$limit) {
    result = result.slice(0, options.$limit);
  }

  return result;
}

// $group 연산자에 해당하는 그룹화 및 집계 작업을 수행하는 함수
function groupAndAggregate(data: any[], group: any): any[] {
  const result = new Map();

  data.forEach((item) => {
    const groupKey = getGroupKey(item, group);
    if (!result.has(groupKey)) {
      result.set(groupKey, initializeAggregationResult(groupKey, group));
    }
    const aggregationResult = result.get(groupKey);
    aggregateItem(aggregationResult, item, group);
  });

  result.forEach((aggregationResult) => {
    finalizeAggregationResult(aggregationResult, group);
  });

  return Array.from(result.values());
}

function getGroupKey(item: any, group: any): string | number | null {
  if (group._id == null) {
    return null;
  }

  const groupId = group._id.startsWith("$")
    ? item[group._id.slice(1)]
    : group._id;
  return groupId;
}

function initializeAggregationResult(
  groupKey: string | number | null,
  group: any
): any {
  const initialResult: any = { _id: groupKey };
  Object.keys(group).forEach((opKey) => {
    if (opKey !== "_id") {
      initialResult[opKey] = undefined;
    }
  });
  return initialResult;
}

function aggregateItem(aggregationResult: any, item: any, group: any): void {
  Object.keys(group).forEach((field) => {
    if (field !== "_id") {
      const operation = group[field];
      if (typeof operation === "object") {
        const opType = Object.keys(operation)[0];
        // 문자열인지 확인하고, 문자열이 아니면 기본값을 사용합니다.
        let opValue =
          typeof operation[opType] === "string" &&
          operation[opType].startsWith("$")
            ? item[operation[opType].slice(1)]
            : operation[opType];

        switch (opType) {
          case "$sum":
            // $sum 연산 처리
            // 여기서는 opValue가 숫자일 수도 있으니, 별도의 검사 없이 바로 덧셈을 수행합니다.
            if (!aggregationResult[field]) {
              aggregationResult[field] = 0; // 초기화
            }
            aggregationResult[field] += opValue;
            break;
          case "$avg":
            // $avg 연산 처리를 여기에 추가...
            break;
          case "$min":
            if (
              aggregationResult[field] === undefined ||
              opValue < aggregationResult[field]
            ) {
              aggregationResult[field] = opValue;
            }
            break;
          case "$max":
            // $max 연산 처리
            if (
              aggregationResult[field] === undefined ||
              opValue > aggregationResult[field]
            ) {
              aggregationResult[field] = opValue;
            }
            break;

          // 배열 데이터를 수집하여 나중에 처리
          case "$median":
          case "$stdDevPop":
          case "$stdDevSamp":
            if (!Array.isArray(aggregationResult[field])) {
              aggregationResult[field] = [];
            }
            aggregationResult[field].push(opValue);
            break;

          default:
            throw new Error(`Unsupported operator: ${opType}`);
        }
      } else {
        // operation이 객체가 아니면 오류를 발생시킵니다.
        throw new Error(`Unsupported structure for field: ${field}`);
      }
    }
  });
}

function finalizeAggregationResult(aggregationResult: any, group: any): void {
  Object.keys(group).forEach((field) => {
    if (field !== "_id" && aggregationResult[field]) {
      if (group[field].$avg) {
        // $avg 최종 계산
        aggregationResult[field] =
          aggregationResult[field].sum / aggregationResult[field].count;
      } else if (group[field].$median) {
        // $median 최종 계산
        if (Array.isArray(aggregationResult[field])) {
          const sortedValues = aggregationResult[field].sort(
            (a: any, b: any) => a - b
          );
          const midIndex = Math.floor(sortedValues.length / 2);
          aggregationResult[field] =
            sortedValues.length % 2 !== 0
              ? sortedValues[midIndex]
              : (sortedValues[midIndex - 1] + sortedValues[midIndex]) / 2;
        }
      } else if (group[field].$stdDevPop) {
        // $stdDevPop 최종 계산
        if (
          Array.isArray(aggregationResult[field]) &&
          aggregationResult[field].length > 0
        ) {
          aggregationResult[field] = math.std(
            aggregationResult[field],
            "uncorrected"
          ); // 모집단 표준편차
        }
      } else if (group[field].$stdDevSamp) {
        // $stdDevSamp 최종 계산
        if (
          Array.isArray(aggregationResult[field]) &&
          aggregationResult[field].length > 1
        ) {
          // 표본은 두 개 이상의 데이터가 필요
          aggregationResult[field] = math.std(aggregationResult[field]); // 표본 표준편차
        }
      }
      // 다른 집계 연산 처리...
    }
  });
}
