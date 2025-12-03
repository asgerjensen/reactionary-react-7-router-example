import { SpanStatusCode, trace,  type Tracer, type Histogram } from "@opentelemetry/api";
import { metrics } from "@opentelemetry/api";

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

export interface DemoStoreMeter {
  requestDuration: Histogram;
}


let globalMeter: DemoStoreMeter | null = null; 
export function getMeter(): DemoStoreMeter {
  if (!globalMeter) {
    const meterInstance = metrics.getMeter("reactionary-react-router-7-example", "1.0.0");
    globalMeter = {
      requestDuration: meterInstance.createHistogram("requestDuration", {
        description: "Duration of requests in milliseconds",
      }),
    }
  }
  return globalMeter;
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
  const now = performance.now();
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
      const duration = performance.now() - now;
      getMeter().requestDuration.record(duration, {
        ...attributes,
        'labels.status': error ? 'error' : 'ok',  
      });
      span.end();
    },
  );
}