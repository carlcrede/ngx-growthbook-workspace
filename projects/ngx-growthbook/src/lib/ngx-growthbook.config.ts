import { Context, Result, FeatureResult } from '@growthbook/growthbook';
import { Type } from '@angular/core';

export interface TrackingService {
  trackExperiment(experiment: string, result: Result<any>): void;
  trackFeature?(featureKey: string, result: FeatureResult<any>): void;
}

export interface NgxGrowthbookConfiguration extends Context {
  clientKey: string;
  enableDevMode?: boolean;
  backgroundSync?: boolean;
  subscribeToChanges?: boolean;
  trackingService?: Type<TrackingService>; // Service class reference
}
