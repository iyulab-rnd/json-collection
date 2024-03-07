// src/Find.ts
// mongodb 의 db.collection.find({?}) 문법을 모방한 구현입니다.
import { compare, compareValues, matchFilter } from "./Functions";

export interface FindOptions {
  $match?: any;
  $sort?: { [key: string]: 1 | -1 };
  $limit?: number;
}

export function find(data: any[], options: FindOptions): any[] {
  let result = [...data]; // 데이터를 복사하여 원본 데이터를 변경하지 않습니다.

  if (options.$match) {
    result = result.filter((item) => matchFilter(item, options.$match));
  }

  if (options.$sort) {
    result = result.sort((a, b) => compare(a, b, options.$sort));
  }

  if (options.$limit) {
    result = result.slice(0, options.$limit);
  }

  return result;
}
