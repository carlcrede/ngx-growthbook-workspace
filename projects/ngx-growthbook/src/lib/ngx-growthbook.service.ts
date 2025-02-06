import { Injectable, OnDestroy } from '@angular/core';
import {
  GrowthBook,
  Context,
  Attributes,
  RefreshFeaturesOptions,
} from '@growthbook/growthbook';
import { Subject, takeUntil } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NgxGrowthbookService implements OnDestroy {
  constructor() {
  }

  growthBook!: GrowthBook;
  private growthBookSource = new Subject();
  private eventCount = 0;
  private destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.growthBookSource.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }

  async init(config: Context) {
    this.growthBook = new GrowthBook({
      enableDevMode: true,
      subscribeToChanges: true,
      backgroundSync: true,
      trackingCallback: (experiment, result) => {},
      onFeatureUsage: (featureKey, result) => {},
      attributes: {},
      ...config,
    });

    await this.growthBook.loadFeatures();

    this.growthBook.setRenderer(() => {
      this.triggerUpdate();
    });

    return new Promise<void>((resolve) => {
      setTimeout(() => {
        console.log('GrowthBook initialized');
        resolve();
      }, 1000);
    });
  }

  triggerUpdate(): void {
    this.growthBookSource.next((this.eventCount += 1));
  }

  subscribe(callback: (n: number) => void) {
    callback(0);
    return this.growthBookSource.pipe(takeUntil(this.destroy$)).subscribe();
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
