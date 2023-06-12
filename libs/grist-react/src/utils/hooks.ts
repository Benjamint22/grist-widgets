import { useEffect, useState } from "react";
import { Observable } from "rxjs";

export function useObservable<T>(observable: Observable<T>, initialValue: T) {
  const [state, setState] = useState(initialValue);
  useEffect(() => {
    const subscription = observable.subscribe(setState);
    return () => subscription.unsubscribe();
  }, [observable]);
  return state;
}
