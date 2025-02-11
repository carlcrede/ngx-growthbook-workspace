import {
  inject,
  provideAppInitializer,
  Provider,
  makeEnvironmentProviders,
} from '@angular/core';
import { NGX_GROWTHBOOK_CONFIG_TOKEN } from './ngx-growthbook.tokens';
import { NgxGrowthbookService } from './ngx-growthbook.service';
import { NgxGrowthbookConfiguration } from './ngx-growthbook.config';

export function provideNgxGrowthbook(config: NgxGrowthbookConfiguration) {
  if (!config.clientKey) {
    throw new Error('GrowthBook clientKey is required');
  }

  const providers: Provider[] = [
    {
      provide: NGX_GROWTHBOOK_CONFIG_TOKEN,
      useValue: config,
    },
    NgxGrowthbookService,
  ];

  if (config.trackingService) {
    providers.push(config.trackingService);
  }

  return makeEnvironmentProviders([
    ...providers,
    provideAppInitializer(async () => {
      const growthbookService = inject(NgxGrowthbookService);
      const trackingService = config.trackingService
        ? inject(config.trackingService)
        : null;
      await growthbookService.init(config, trackingService);
    }),
  ]);
}
