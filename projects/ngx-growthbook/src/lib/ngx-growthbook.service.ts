import { Injectable, OnDestroy, Inject } from '@angular/core';
import {
  GrowthBook,
  Context,
  Attributes,
  RefreshFeaturesOptions,
  FeatureResult,
} from '@growthbook/growthbook';
import { Subject, takeUntil, Observable } from 'rxjs';
import { NGX_GROWTHBOOK_CONFIG_TOKEN } from './ngx-growthbook.tokens';
import {
  NgxGrowthbookConfiguration,
  TrackingService,
} from './ngx-growthbook.config';

export { type FeatureResult, type Result } from '@growthbook/growthbook';

@Injectable({
  providedIn: 'root',
})
export class NgxGrowthbookService implements OnDestroy {
  private growthBook!: GrowthBook;
  private readonly growthBookSource = new Subject<number>();
  private eventCount = 0;
  private readonly destroy$ = new Subject<void>();

  constructor(
    @Inject(NGX_GROWTHBOOK_CONFIG_TOKEN)
    private config: NgxGrowthbookConfiguration
  ) {}

  ngOnDestroy() {
    this.growthBookSource.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  async init(config: Context, trackingService?: TrackingService | null) {
    if (!config.clientKey) {
      throw new Error('GrowthBook clientKey is required');
    }

    console.log('Initializing GrowthBook...');

    this.growthBook = new GrowthBook({
      trackingCallback: trackingService
        ? (experiment, result) => {
            trackingService?.trackExperiment(experiment.key, result);
          }
        : config.trackingCallback,
      onFeatureUsage: trackingService
        ? (featureKey, result) => {
            trackingService?.trackFeature?.(featureKey, result);
          }
        : config.onFeatureUsage,
      ...config,
    });

    await this.growthBook.init({ skipCache: true, streaming: true });

    this.growthBook.setRenderer(() => {
      this.triggerUpdate();
    });

    console.log('...GrowthBook initialized');

    return this.growthBook;
  }

  triggerUpdate(): void {
    this.growthBookSource.next((this.eventCount += 1));
  }

  subscribe(callback: (n: number) => void) {
    callback(0);
    return this.growthBookSource
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        callback;
      });
  }

  public getFeature<T>(featureKey: string, defaultValue?: T): FeatureResult<T> {
    return this.evaluateFeatureSync<T>(featureKey, defaultValue);
  }

  /**
   * Evaluates a feature and returns an observable that will emit whenever the feature changes
   * @param featureKey The feature key to evaluate
   * @param defaultValue The default value if the feature is not found
   */
  public evaluateFeature<T>(featureKey: string, defaultValue?: T) {
    const evaluate = () => {
      const result = this.growthBook.evalFeature(featureKey);
      return result;
    };

    // Initial evaluation
    const initial = evaluate();

    // Create an observable that emits whenever features are updated
    return new Observable<FeatureResult<T>>((subscriber) => {
      subscriber.next(initial);

      const subscription = this.growthBookSource
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          subscriber.next(evaluate());
        });

      return () => subscription.unsubscribe();
    });
  }

  /**
   * Evaluates a feature and returns the current value synchronously
   * @param featureKey The feature key to evaluate
   * @param defaultValue The default value if the feature is not found
   */
  public evaluateFeatureSync<T>(
    featureKey: string,
    defaultValue?: T
  ): FeatureResult<T> {
    const result = this.growthBook.evalFeature(featureKey);
    return result;
  }

  public loadFeatures(): Promise<void> {
    return this.growthBook.loadFeatures();
  }

  public isOn(featureKey: string): boolean {
    return this.growthBook.isOn(featureKey);
  }

  public isOff(featureKey: string): boolean {
    return this.growthBook.isOff(featureKey);
  }

  public setFeatureValue(featureKey: string) {
    if (featureKey) {
      this.growthBook.setFeatures({
        featureKey: { defaultValue: true },
      });
    }
  }

  public getFeatureValue(featureKey: string, defaultValue: any) {
    return this.growthBook.getFeatureValue(featureKey, defaultValue);
  }

  /**
   * In addition to the isOn and getFeatureValue helper methods,
   * there is the evalFeature method that gives you more detailed
   * information about why the value was assigned to the user.
   * @param featureKey
   * @returns
   */
  public evalFeature(featureKey: string) {
    return this.growthBook.evalFeature(featureKey);
  }

  /**
   * Completely replaces attributes
   * @param attributes
   */
  public setAttributes(attributes: Attributes) {
    return this.growthBook.setAttributes(attributes);
  }

  public updateAttributes(attributes: Attributes) {
    const existingAttributes = this.getAttributes();
    return this.growthBook.setAttributes({
      ...existingAttributes,
      ...attributes,
    });
  }

  public refreshFeatures(options?: RefreshFeaturesOptions) {
    return this.growthBook.refreshFeatures(options);
  }

  public setURL(url: string) {
    return this.growthBook.setURL(url);
  }

  public getAttributes() {
    return this.growthBook.getAttributes();
  }

  public getFeatures() {
    return this.growthBook.getFeatures();
  }

  public getExperiments() {
    return this.growthBook.getExperiments();
  }
}
