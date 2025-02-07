import { APP_INITIALIZER, Injector, Provider } from '@angular/core';
import { NGX_GROWTHBOOK_CONFIG_TOKEN } from './ngx-growthbook.tokens';
import { NgxGrowthbookService } from './ngx-growthbook.service';
import { Context } from '@growthbook/growthbook';


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
  return () => {
    console.log('Setting up GrowthBook with context:', context);
    if (!context.clientKey) {
      throw new Error('GrowthBook clientKey is required in context');
    }
    return growthbookService.init(context);
  };
}

export function provideGrowthBook(context: Context): Provider[] {
  if (!context.clientKey) {
    throw new Error('GrowthBook clientKey is required');
  }

  return [
    {
      provide: NgxGrowthbookService,
      useClass: NgxGrowthbookService,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: (growthbookService: NgxGrowthbookService) => 
        setupGrowthbookFactory(growthbookService, context),
      multi: true,
      deps: [NgxGrowthbookService],
    },
  ];
}
