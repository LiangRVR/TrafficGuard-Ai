import { useEffect } from "react";

export function useAutoRefresh(fn, interval = 30000) {
  //Automatically calls `fn` on mount and then every `interval` ms.
  useEffect(() => {
    // call once immediately
    fn();

    if (interval == null) return;

    const id = setInterval(fn, interval);
    return () => clearInterval(id);
  }, [fn, interval]);
}
