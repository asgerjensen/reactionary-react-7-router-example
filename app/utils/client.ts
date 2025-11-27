

import {
  ClientBuilder,
  createInitialRequestContext,
  MemoryCache,
  NoOpCache,
  PaymentMethodIdentifierSchema,
  PaymentMethodSchema,
  type RequestContext,
  RequestContextSchema,
} from '@reactionary/core';
import { type CommercetoolsConfiguration, withCommercetoolsCapabilities } from '@reactionary/provider-commercetools';
import { type AlgoliaConfiguration, withAlgoliaCapabilities } from '@reactionary/provider-algolia';
import type { Session, SessionData } from 'react-router';


export function createDefaultContext() {
  return RequestContextSchema.parse({
    id: 'test-session-id',
    languageContext: {
      locale: 'en',
      currencyCode: 'USD',
      countryCode: 'US',
    },
    storeIdentifier: {
      key: 'the-good-store',
    },
  });
}

export function getAlgoliaConfiguration(): AlgoliaConfiguration {
  return {
    apiKey: process.env['ALGOLIA_API_KEY'] || '',
    appId: process.env['ALGOLIA_APP_ID'] || '',
    indexName: process.env['ALGOLIA_INDEX'] || ''
  }
}

export function getCommercetoolsConfiguration(): CommercetoolsConfiguration {
  return {
    apiUrl: process.env['CTP_API_URL'] || '',
    authUrl: process.env['CTP_AUTH_URL'] || '',
    clientId: process.env['CTP_CLIENT_ID'] || '',
    clientSecret: process.env['CTP_CLIENT_SECRET'] || '',
    projectKey: process.env['CTP_PROJECT_KEY'] || '',
    scopes: (process.env['CTP_SCOPES'] || '')
      .split(',')
      .map((x) => x.trim())
      .filter((x) => x && x.length > 0),

    paymentMethods: [
      PaymentMethodSchema.parse({
        identifier: PaymentMethodIdentifierSchema.parse({
          paymentProvider: 'stripe',
          method: 'stripe',
          name: 'Stripe',
        }),
        description: 'Stripe payment gateway',
      }),
    ],
  };
}




export async function createReqContext(request: Request, session: Session<SessionData, SessionData>): Promise<RequestContext> {
  const reqCtx = createInitialRequestContext();
  if (!session.has('reactionarySession')) {
    session.set('reactionarySession', {});
  }
  reqCtx.session = session.get('reactionarySession');
  reqCtx.clientIp = request.headers.get('X-Forwarded-For') || request.headers.get('Remote-Addr') || '';
  reqCtx.userAgent = request.headers.get('User-Agent') || '';
  reqCtx.isBot = /bot|crawler|spider|crawling/i.test(reqCtx.userAgent || '');
  reqCtx.referrer = request.headers.get('Referer') || '';
  reqCtx.correlationId = request.headers.get('X-Correlation-ID') || 'remix-' + Math.random().toString(36).substring(2, 15);
  return reqCtx;
}

export async function createClient(reqCtx: RequestContext) {



  const client = new ClientBuilder(reqCtx)
    .withCapability(withAlgoliaCapabilities(
      getAlgoliaConfiguration(),
      {
        productSearch: true
      }
    ))
    .withCapability(withCommercetoolsCapabilities(
      getCommercetoolsConfiguration(),
      {
        cart: true,
        category: true,
        checkout: true,
        identity: true,
        inventory: true,
        order: true,
        price: true,
        product: true,
        productSearch: false
      },
    ))
    .withCache(new NoOpCache())
    .build();

  return client;
}
