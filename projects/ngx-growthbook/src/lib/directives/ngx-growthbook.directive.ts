import {
  Directive,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxGrowthbookService } from '../ngx-growthbook.service';

@Directive({
  selector: '[growthbook]',
})
export class GrowthBookDirective implements OnInit, OnDestroy {
  private hasView: boolean = false;
  private featureKey: string = '';
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
    const shouldDisplay = this.growthbookService.isOn(this.featureKey);
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

  @Input() set growthbook(input: { featureKey: string }) {
    this.featureKey = input.featureKey;
    this.verifyForUpdate();
  }

  ngOnDestroy(): void {
    this.growthbookSubscription$.unsubscribe();
  }
}
