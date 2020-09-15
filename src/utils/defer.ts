import xs, { Stream, Subscription } from "xstream";

export default function defer<T>(create: () => Stream<T>) {
  let sub: Subscription;

  return xs.create<T>({
    start(observer) {
      sub = create().subscribe(observer);
    },
    stop() {
      sub?.unsubscribe();
    },
  });
}
