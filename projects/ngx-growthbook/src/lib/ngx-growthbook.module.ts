import {
  APP_INITIALIZER,
  Injector,
  ModuleWithProviders,
  NgModule,
  PLATFORM_ID,
} from '@angular/core';
import { NgxGrowthbookService } from './ngx-growthbook.service';
import { NgxGrowthbookConfiguration } from './ngx-growthbook.config';
import { NGX_GROWTHBOOK_CONFIG_TOKEN } from './ngx-growthbook.tokens';
import {
  GrowthBookDirective,
  GrowthBookNotDirective,
  GrowthBookVariationDirective,
} from './directives';

// NgModule({
//   declarations: [
//     GrowthBookDirective,
//     GrowthBookNotDirective,
//     GrowthBookVariationDirective,
//   ],
//   exports: [
//     GrowthBookDirective,
//     GrowthBookNotDirective,
//     GrowthBookVariationDirective,
//   ],
//   providers: [NgxGrowthbookService],
// });
// export class NgxGrowthbookModule {
//   static forRoot(
//     config: NgxGrowthbookConfiguration
//   ): ModuleWithProviders<NgxGrowthbookModule> {
//     return {
//       ngModule: NgxGrowthbookModule,
//       providers: [
//         { provide: NGX_GROWTHBOOK_CONFIG_TOKEN, useValue: config },
//         NgxGrowthbookService,
//         {
//           provide: APP_INITIALIZER,
//           useFactory: initializeGrowthbook,
//           deps: [
//             PLATFORM_ID,
//             NGX_GROWTHBOOK_CONFIG_TOKEN,
//             NgxGrowthbookService,
//           ],
//           multi: true,
//         },
//       ],
//     };
//   }
// }

export function initializeGrowthbook(injector: Injector) {
  return async () => {
    const config = injector.get(NGX_GROWTHBOOK_CONFIG_TOKEN);
    const growthbookService = injector.get(NgxGrowthbookService);
    await growthbookService.init(config);
  };
}
