# NgxGrowthbook

An Angular wrapper for GrowthBook, providing feature flags and A/B testing capabilities with full TypeScript support.

## Installation

```bash
npm install @growthbook/growthbook ngx-growthbook
```

## Setup

1. Import and configure GrowthBook in your app.config.ts:

```typescript
import { provideNgxGrowthbook } from "ngx-growthbook";

export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxGrowthbook({
      clientKey: "your-growthbook-client-key",
      enableDevMode: true, // optional
      backgroundSync: true, // optional
      subscribeToChanges: true, // optional
      trackingService: MyAnalyticsService, // optional
    }),
  ],
};
```

2. (Optional) Implement tracking for experiments and feature uasge:

- By providing a trackingCallback and onFeatureUsage callback:

```typescript
import { provideNgxGrowthbook } from "ngx-growthbook";
export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxGrowthbook({
      subscribeToChanges: true,
      backgroundSync: true,
      apiHost: "https://cdn.growthbook.io",
      clientKey: "sdk-eeaqNb4SLXF4xjHp",
      enableDevMode: true,
      trackingCallback: (experiment, result) => {
        console.log(`Experiment ${experiment} viewed with variant ${result.variationId}`);
        // track event..
      },
      onFeatureUsage: (feature, result) => {
        console.log(`Feature ${feature} used with value ${result.value}`);
        // track feature usage..
      },
    }),
  ],
};
```

- By providing a tracking service, which implements the `TrackingService` interface:
```typescript
import { Injectable } from "@angular/core";
import { TrackingService, Result, FeatureResult } from "ngx-growthbook";

@Injectable({ providedIn: "root" })
export class MyAnalyticsService implements TrackingService {
  trackExperiment(experiment: string, result: Result<any>) {
    // Track experiment exposure
    analytics.track("Experiment Viewed", {
      experimentId: experiment,
      variant: result.variationId,
    });
  }

  trackFeature(featureKey: string, result: FeatureResult<any>) {
    // Track feature usage
    analytics.track("Feature Used", {
      feature: featureKey,
      value: result.value,
    });
  }
}

import { provideNgxGrowthbook } from "ngx-growthbook";
export const appConfig: ApplicationConfig = {
  providers: [
    provideNgxGrowthbook({
      subscribeToChanges: true,
      backgroundSync: true,
      apiHost: "https://cdn.growthbook.io",
      clientKey: "sdk-eeaqNb4SLXF4xjHp",
      enableDevMode: true,
      trackingService: MyAnalyticsService,
    }),
  ],
};
```

## Additional setup
### Attribute updates
Attributes can be set in config when initializing the service, or updated later using the `updateAttributes` method.
However you may want to update attributes in your app in certain cases, for example when a user logs in / out.
```typescript
this.growthbook.updateAttributes({
  subscriptionTier: "premium",
});
```

### URL update
The GrowthBook SDK will usually automatically update the URL when the feature state changes.
However you may want to update the current URL in your app. This may be important if using Visual Experiments. One approach is to update the URL on the router level.
It can be done like so:
```typescript
export class AppRoutingModule {
  constructor(
    private router: Router,
    private growthbook: NgxGrowthbookService,
  ) {
    this.router.events.subscribe({
      next: (event: Event) => {
        if (event instanceof NavigationEnd) {
          this.growthbook.setURL(window.location.href);
          this.growthbook.updateAttributes({ url: window.location.href });
          this.growthbook.refreshFeatures();
        }
      },
      error: (err) => console.error(err),
    });
  }
}
```

## Usage

### 1. Observable Approach

```typescript
export class YourComponent implements OnInit {
  feature$: Observable<FeatureResult<string>>;

  constructor(private growthbook: NgxGrowthbookService) {
    this.feature$ = this.growthbook.evaluateFeature<string>("feature-key", "default-value");
  }
}
```

### 2. Sync Evaluation

```typescript
export class YourComponent {
  feature: FeatureResult<boolean>;

  constructor(private growthbook: NgxGrowthbookService) {
    this.feature = this.growthbook.evaluateFeatureSync<boolean>("feature-key", false);
  }
}
```

### 3. Template Usage

```html
@if (growthbook.isOn('feature-key')) {
   <div>Feature is enabled!</div>
}
```

### Available Methods

#### Feature Flags

```typescript
// Check if a feature is enabled
growthbook.isOn("feature-key");

// Get feature value
growthbook.getFeatureValue("feature-key", defaultValue);

// Evaluate feature with full result
growthbook.evalFeature("feature-key");

// Reactive feature evaluation
growthbook.evaluateFeature("feature-key").subscribe((result) => {
  console.log("Feature status:", result.on);
  console.log("Feature value:", result.value);
});
```

#### Attributes

```typescript
// Set user attributes
growthbook.setAttributes({
  id: "user-123",
  deviceId: "device-456",
  company: "acme",
});

// Update attributes
growthbook.updateAttributes({
  subscriptionTier: "premium",
});
```

#### Other Methods

```typescript
// Refresh features
growthbook.refreshFeatures();

// Set URL (important for Visual Experiments)
growthbook.setURL("http://my-web.site/some-route");

// Get current attributes
growthbook.getAttributes();

// Get all features
growthbook.getFeatures();

// Get running experiments
growthbook.getExperiments();
```

## Configuration Options

| Option             | Type                  | Description                               |
| ------------------ | --------------------- | ----------------------------------------- |
| clientKey          | string                | Your GrowthBook client key (required)     |
| enableDevMode      | boolean               | Enable development mode                   |
| backgroundSync     | boolean               | Auto-refresh features                     |
| subscribeToChanges | boolean               | Enable real-time updates                  |
| trackingService    | Type<TrackingService> | Service for tracking experiments/features |
| apiHost            | string                | The GrowthBook API host (default: "https://cdn.growthbook.io") |
| trackingCallback   | (experiment: string, result: Result<any>) => void | Callback for tracking experiments |
| onFeatureUsage     | (feature: string, result: FeatureResult<any>) => void | Callback for tracking feature usage |

## TypeScript Support

The library provides full TypeScript support for feature values and experiment results:

```typescript
interface MyFeature {
  color: string;
  size: number;
}

growthbook.evaluateFeature<MyFeature>("feature-key").subscribe((result) => {
  const value = result.value; // typed as MyFeature
});
```

## Building

To build the library, run:

```bash
ng build ngx-growthbook
```

The build artifacts will be stored in the `dist/` directory.

## Running Tests

Execute unit tests via [Karma](https://karma-runner.github.io):

```bash
ng test
```

## Contributing

Contributions are welcome! Please submit pull requests for any improvements.

## License

MIT
