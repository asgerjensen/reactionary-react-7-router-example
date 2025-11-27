import { SpanStatusCode, trace, type Tracer } from "@opentelemetry/api";
import type { unstable_ServerInstrumentation, unstable_InstrumentationHandlerResult } from "react-router";

let globalTracer: Tracer | null = null;

export function getTracer(): Tracer {
  if (!globalTracer) {
    // Simply get the tracer from the API
    // If the SDK is not initialized by the host application,
    // this will return a ProxyTracer that produces NonRecordingSpans
    globalTracer = trace.getTracer("reactionary-react-router-7-example", "1.0.0");
  }
  return globalTracer;
}



export const otelInstrumentation: unstable_ServerInstrumentation = {
  handler({ instrument }) {
    instrument({
      request: (fn, { request }) =>
        otelSpan(`request`, { url: request.url }, fn),
    });
  },
  route({ instrument, id }) {
    instrument({
      middleware: (fn, { unstable_pattern }) =>
        otelSpan(
          "middleware",
          { routeId: id, pattern: unstable_pattern },
          fn,
        ),
      loader: (fn, { unstable_pattern }) =>
        otelSpan(
          "loader",
          { routeId: id, pattern: unstable_pattern },
          fn,
        ),
      action: (fn, { unstable_pattern }) =>
        otelSpan(
          "action",
          { routeId: id, pattern: unstable_pattern },
          fn,
        ),
    });
  },
};



async function otelSpan(
  label: string,
  attributes: Record<string, string>,
  cb: () => Promise<unstable_InstrumentationHandlerResult>,
) {
  return getTracer().startActiveSpan(
    label,
    { attributes },
    async (span) => {
      const { error } = await cb();
      if (error) {
        span.recordException(error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
        });
      }
      span.end();
    },
  );
}