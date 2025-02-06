import { APP_INITIALIZER, Inject, Injector, Provider } from '@angular/core';
import { NgxGrowthbookConfiguration } from './ngx-growthbook.config';
import { NGX_GROWTHBOOK_CONFIG_TOKEN } from './ngx-growthbook.tokens';
import { NgxGrowthbookService } from './ngx-growthbook.service';
import { Context } from '@growthbook/growthbook';

// export function provideGrowthbook(config: NgxGrowthbookConfiguration) {
//   return [
//     { provide: NGX_GROWTHBOOK_CONFIG_TOKEN, useValue: config },
//     {
//     provide: APP_INITIALIZER,
//     useFactory: (injector: Injector) => initializeGrowthbook(injector),
//     multi: true,
//     deps: [Injector],
//   }]
// }

function initializeGrowthbook(injector: Injector) {
  return async () => {
    const config = injector.get(NGX_GROWTHBOOK_CONFIG_TOKEN);
    const growthbookService = injector.get(NgxGrowthbookService);
    await growthbookService.init(config);
  };
}

export function setupGrowthbookFactory(
  growthbookService: NgxGrowthbookService,
  context: Context,
) {
  return async () => growthbookService.init(context);
}

export function provideGrowthBook(context: Context): Provider[] {
  return [
    NgxGrowthbookService,
    {
      provide: APP_INITIALIZER,
      useFactory: (growthbookService: NgxGrowthbookService) => setupGrowthbookFactory(growthbookService, context),
      multi: true,
      deps: [NgxGrowthbookService],
    },
  ];
}

// export const GrowthBookInitializerProvider: Provider = {
//   provide: APP_INITIALIZER,
//   useFactory: (injector: Injector) => initializeGrowthbook(injector),
//   multi: true,
//   deps: [Injector],
// };
