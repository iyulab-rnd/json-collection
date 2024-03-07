// src/Functions.ts

import * as math from "mathjs";
// import { List } from "immutable";
// import linq from "linq";
// import { MathNumericType } from "mathjs";

// $sort 연산자에 해당하는 정렬 작업을 수행하는 함수
export function compare(a: any, b: any, sort: any): number {
  for (const key in sort) {
    if (a[key] !== b[key]) {
      return (a[key] < b[key] ? -1 : 1) * (sort[key] === -1 ? -1 : 1);
    }
  }
  return 0;
}

// 값을 비교하는 함수
export function compareValues(
  value1: any,
  value2: any,
  operator: string
): boolean {
  switch (operator) {
    case "$eq":
      return value1 === value2;
    case "$gt":
      return value1 > value2;
    case "$gte":
      return value1 >= value2;
    case "$lt":
      return value1 < value2;
    case "$lte":
      return value1 <= value2;
    case "$ne":
      return value1 !== value2;
    case "$in":
      return Array.isArray(value2) && value2.includes(value1);
    case "$nin":
      return Array.isArray(value2) && !value2.includes(value1);
    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
}

export function matchFilter(item: any, match: any): boolean {
  return Object.keys(match).every((key) => {
    const matchValue = match[key];
    // MongoDB의 비교 연산자를 처리
    if (typeof matchValue === "object" && !(matchValue instanceof Array)) {
      if (key === "$or") {
        return matchValue.some((condition: any) =>
          matchFilter(item, condition)
        );
      } else if (key === "$and") {
        return matchValue.every((condition: any) =>
          matchFilter(item, condition)
        );
      } else {
        const operator = Object.keys(matchValue)[0];
        const value = matchValue[operator];
        return compareValues(item[key], value, operator);
      }
    } else {
      return item[key] === matchValue;
    }
  });
}

// 집계 연산 초기화
export function initializeAggregationResults(
  group: any
): Map<string | number | null, any> {
  return new Map();
}

// 집계 연산 수행
export function performAggregation(
  data: any[],
  group: any,
  resultsMap: Map<string | number | null, any>
): void {
  data.forEach((item) => {
    const groupKey = getGroupKey(item, group);
    if (!resultsMap.has(groupKey)) {
      resultsMap.set(groupKey, initializeAggregationResult(groupKey, group));
    }
    const aggregationResult = resultsMap.get(groupKey);
    aggregateItem(aggregationResult, item, group);
  });
}

// 집계 연산 결과 최종화
export function finalizeAggregationResults(
  resultsMap: Map<string | number | null, any>,
  group: any
): any[] {
  resultsMap.forEach((aggregationResult) => {
    finalizeAggregationResult(aggregationResult, group);
  });
  return Array.from(resultsMap.values());
}

// // $group 연산자에 해당하는 그룹화 및 집계 작업을 수행하는 함수
// function groupAndAggregate(data: any[], group: any): any[] {
//   const result = new Map();

//   data.forEach((item) => {
//     const groupKey = getGroupKey(item, group);
//     if (!result.has(groupKey)) {
//       result.set(groupKey, initializeAggregationResult(groupKey, group));
//     }
//     const aggregationResult = result.get(groupKey);
//     aggregateItem(aggregationResult, item, group);
//   });

//   result.forEach((aggregationResult) => {
//     finalizeAggregationResult(aggregationResult, group);
//   });

//   return Array.from(result.values());
// }

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
            if (!aggregationResult[field]) {
              aggregationResult[field] = { sum: 0, count: 0 }; // 초기화
            }
            aggregationResult[field].sum += opValue;
            aggregationResult[field].count += 1;
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
        if (aggregationResult[field].count > 0) {
          // 분모가 0이 아닐 때만 계산
          aggregationResult[field] =
            aggregationResult[field].sum / aggregationResult[field].count;
        } else {
          aggregationResult[field] = null; // 항목이 없는 경우 결과를 null로 설정
        }
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
