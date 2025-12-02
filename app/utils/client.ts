

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
import { type MedusaConfiguration, MedusaConfigurationSchema, withMedusaCapabilities } from '@reactionary/provider-medusa';
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

    facetFieldsForSearch: [ 'attributes.product-colour', 'attributes.cable-length', 'attributes.connector-gender', 'attributes.country-of-origin'],
    paymentMethods: [
      PaymentMethodSchema.parse({
        identifier: PaymentMethodIdentifierSchema.parse({
          paymentProcessor: 'stripe',
          method: 'stripe',
          name: 'Stripe',
        }),
        isPunchOut: true,
        description: 'Stripe payment gateway',
      }),
    ],
  };
}


export function getMedusaConfiguration(): MedusaConfiguration {
  return MedusaConfigurationSchema.parse({
        publishable_key: process.env['MEDUSA_PUBLISHABLE_KEY'] || '',
        adminApiKey: process.env['MEDUSA_ADMIN_KEY'] || '',
        apiUrl: process.env['MEDUSA_API_URL'] || '',
        defaultCurrency: process.env['MEDUSA_DEFAULT_CURRENCY'] || '',
    });

}



export async function createReqContext(request: Request, session: Session<SessionData, SessionData>): Promise<RequestContext> {
  const reqCtx = createInitialRequestContext();
  reqCtx.session = JSON.parse(session.get('reactionarySession') || '{}');
  // console.log("Session data in createReqContext:", session.get('reactionarySession'), reqCtx.session  );
  if (!session.has('reactionarySession')) {
    session.set('reactionarySession', JSON.stringify({}));
  }
  
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
        cart: false,
        category: false,
        checkout: false,
        identity: false,
        inventory: false,
        order: false,
        price: false,
        product: false,
        productSearch: false
      },
    ))
    .withCapability(withMedusaCapabilities(
      getMedusaConfiguration(),
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
