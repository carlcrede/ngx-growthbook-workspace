import { InjectionToken } from '@angular/core';
import { NgxGrowthbookConfiguration } from './ngx-growthbook.config';

export const NGX_GROWTHBOOK_CONFIG_TOKEN =
  new InjectionToken<NgxGrowthbookConfiguration>('ngx-growthbook.config');
