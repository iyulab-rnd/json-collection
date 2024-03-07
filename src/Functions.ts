// src/Functions.ts

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
