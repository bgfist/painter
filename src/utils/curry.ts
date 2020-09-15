type Arr = readonly unknown[];

export function curry<T extends Arr, U extends Arr, R>(f: (...args: [...T, ...U]) => R, ...headArgs: T) {
  return (...b: U) => f(...headArgs, ...b);
}
