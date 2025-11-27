import type { unstable_ServerInstrumentation, unstable_InstrumentationHandlerResult } from "react-router";

export const requestLoggerInstrumentation: unstable_ServerInstrumentation = {
  handler({ instrument }) {
    instrument({
      request: (fn, { request }) =>
        log(`request ${request.url}`, fn),
    });
  },
  route({ instrument, id }) {
    instrument({
      middleware: (fn) => log(` middleware (${id})`, fn),
      loader: (fn) => log(`  loader (${id})`, fn),
      action: (fn) => log(`  action (${id})`, fn),
    });
  },
};

async function log(
  label: string,
  cb: () => Promise<unstable_InstrumentationHandlerResult>,
) {
  const start = Date.now();
  console.log(`➡️ ${label}`);
  await cb();
  console.log(`⬅️ ${label} (${Date.now() - start}ms)`);
}

