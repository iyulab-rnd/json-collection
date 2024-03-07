// src/JsonCollection.ts
// mongodb 의 db.collection.find(), db.collection.aggregate() 문법을 모방한 구현입니다.
// db.collection 은 new JsonCollection() 생성으로 대체됩니다.
// 사용 예시:
// const collection = new JsonCollection([...]);
// const result = collection.find({}).sort({}).limit(10).toArray();
// const aggregationResult = collection.aggregate([{$match: {}}, {$group: {}}, {$sort: {}}, {$limit: 10}]);

import { find, FindOptions } from "./Find";
import { aggregate, AggregateOptions } from "./Aggregate";
import { compare } from "./Functions";

export interface SortOption {
  [key: string]: 1 | -1;
}

class JsonCollection {
  private data: any[];

  constructor(data: any[]) {
    this.data = data;
  }

  // find 메서드는 FindOptions 타입의 옵션을 받아서 JsonCollection 인스턴스를 반환합니다.
  find(options?: FindOptions): JsonCollection {
    // 'find' 함수를 사용하여 데이터 필터링
    const filteredData = find(this.data, options);
    // 새 JsonCollection 인스턴스를 반환
    return new JsonCollection(filteredData);
  }

  // aggregate 메서드는 AggregateOptions 타입의 옵션을 받아서 결과 배열을 반환합니다.
  aggregate(options: AggregateOptions): any[] {
    // 'aggregate' 함수를 사용하여 데이터 집계
    return aggregate(this.data, options);
  }

  // 데이터를 반환하는 메서드
  toArray(): any[] {
    return this.data;
  }

  sort(sortOptions: SortOption): JsonCollection {
    // 'compare' 함수를 사용하여 데이터 정렬
    const sortedData = [...this.data].sort((a, b) =>
      compare(a, b, sortOptions)
    );
    // 새 JsonCollection 인스턴스를 반환
    return new JsonCollection(sortedData);
  }

  limit(limitNumber: number): JsonCollection {
    // 데이터를 제한된 개수만큼만 포함하도록 자름
    const limitedData = this.data.slice(0, limitNumber);
    // 새 JsonCollection 인스턴스를 반환
    return new JsonCollection(limitedData);
  }
}

export { JsonCollection };
