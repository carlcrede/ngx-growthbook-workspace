import {
  Directive,
  OnInit,
  OnDestroy,
  TemplateRef,
  ViewContainerRef,
  Input,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxGrowthbookService } from '../ngx-growthbook.service';

@Directive({
  selector: '[growthbookVariation]',
})
export class GrowthBookVariationDirective implements OnInit, OnDestroy {
  private hasView: boolean = false;
  private featureKey: string = '';
  private variation: any;
  private growthbookSubscription$: Subscription = new Subscription();

  constructor(
    private templateRef: TemplateRef<unknown>,
    private viewContainer: ViewContainerRef,
    private growthbookService: NgxGrowthbookService
  ) {}

  ngOnInit(): void {
    this.growthbookSubscription$ = this.growthbookService.subscribe(
      this.verifyForUpdate.bind(this)
    );
  }

  verifyForUpdate() {
    const shouldDisplay = this.growthbookService.isOn(this.featureKey)
      ? this.growthbookService.getFeatureValue(this.featureKey, null) ===
        this.variation
      : false;
    if (shouldDisplay) {
      if (!this.hasView) {
        this.viewContainer.createEmbeddedView(this.templateRef);
        this.hasView = true;
      }
    } else {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  @Input() set growthbookVariation(input: {
    featureKey: string;
    variation: any;
  }) {
    this.featureKey = input.featureKey;
    this.variation = input.variation;
    this.verifyForUpdate();
  }

  ngOnDestroy(): void {
    this.growthbookSubscription$.unsubscribe();
  }
}
