import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/**
 * Guarda os dados já carregados (devocionais, perfil, assinatura) no aparelho
 * e devolve na próxima abertura, para as telas aparecerem preenchidas na hora.
 */
export function QueryPersistence() {
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;

    void (async () => {
      try {
        const [{ persistQueryClient }, { createSyncStoragePersister }] = await Promise.all([
          import("@tanstack/react-query-persist-client"),
          import("@tanstack/query-sync-storage-persister"),
        ]);
        if (cancelled) return;

        const persister = createSyncStoragePersister({
          storage: window.localStorage,
          key: "dg-query-cache",
          throttleTime: 1500,
        });

        const [unsub] = persistQueryClient({
          queryClient,
          persister,
          maxAge: 24 * 60 * 60 * 1000,
          dehydrateOptions: {
            shouldDehydrateQuery: (query) => {
              const key = String(query.queryKey[0] ?? "");
              return (
                query.state.status === "success" &&
                ["devotionals", "profile", "subscription", "is-admin", "quotes"].includes(key)
              );
            },
          },
        });
        unsubscribe = unsub;
      } catch {
        // cache opcional: se falhar, o app segue normal
      }
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [queryClient]);

  return null;
}
