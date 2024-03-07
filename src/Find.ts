// src/Find.ts
// mongodb 의 db.collection.find({?}) 문법을 모방한 구현입니다.
import { matchFilter } from "./Functions";

export interface FindOptions {
  [key: string]: any; // 모든 옵션을 허용하기 위해 제한을 없애었습니다.
}

export function find(data: any[], options?: FindOptions): any[] {
  let result = [...data]; // 데이터를 복사하여 원본 데이터를 변경하지 않습니다.

  if (!options) {
    return result;
  }

  // 모든 옵션에 대해 반복하면서 해당하는 필터를 적용합니다.
  for (const key in options) {
    if (options.hasOwnProperty(key)) {
      // $로 시작하는 옵션은 MongoDB의 특수 옵션으로 처리하지 않습니다.
      if (!key.startsWith("$")) {
        result = result.filter((item) =>
          matchFilter(item, { [key]: options[key] })
        );
      }
    }
  }

  return result;
}
