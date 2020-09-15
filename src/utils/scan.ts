import { NO, Operator, Stream } from "xstream";

class Scan<T, R> implements Operator<T, R> {
  public type: string;
  public ins: Stream<T>;
  public out: Stream<R>;
  public f: (t: T) => R;
  public seed: R;
  private acc: R; // initialized as seed

  constructor(f: (acc: R, t: T) => R, seed: R, ins: Stream<T>) {
    this.type = "scan";
    this.ins = ins;
    this.out = NO as Stream<R>;
    this.f = (t: T) => f(this.acc, t);
    this.acc = this.seed = seed;
  }

  _start(out: Stream<R>): void {
    this.out = out;
    this.acc = this.seed;
    this.ins._add(this);
  }

  _stop(): void {
    this.ins._remove(this);
    this.out = NO as Stream<R>;
    this.acc = this.seed;
  }

  _n(t: T) {
    const u = this.out;
    if (u === NO) return;
    const r = this.f(t);
    if (r === NO) return;
    u._n((this.acc = r as R));
  }

  _e(err: any) {
    const u = this.out;
    if (u === NO) return;
    u._e(err);
  }

  _c() {
    const u = this.out;
    if (u === NO) return;
    u._c();
  }
}

export default function scan<R, T>(accumulate: (acc: R, t: T) => R, seed: R) {
  return function scanOperator(ins: Stream<T>) {
    return new Stream<R>(new Scan<T, R>(accumulate, seed, ins));
  };
}
