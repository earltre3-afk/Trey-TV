// createServerFn proxy so browser code can call Neon through the server.
// The browser gets a client stub; the server executes executeSpec directly.
import { createServerFn } from "@tanstack/react-start";
import { executeSpec, type QuerySpec, type QueryResult } from "./db.server";

export const executeDbQuery = createServerFn({ method: "POST" })
  .inputValidator((input: QuerySpec) => input)
  .handler(async ({ data }): Promise<QueryResult> => executeSpec(data));
