import { Stream } from "xstream";

export default function flattenAll<O extends Record<string, Stream<any>>, K extends keyof O>(...keys: K[]) {
  return function flattenAllOperator(ins: Stream<O>): { [k in K]: O[k] } {
    return keys.reduce<any>((obj, key) => {
      obj[key] = ins.map((o: any) => o[key]).flatten();
      return obj;
    }, {});
  };
}
