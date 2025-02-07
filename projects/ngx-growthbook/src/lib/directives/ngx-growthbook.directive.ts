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

export interface GrowthBookContext {
  isOn: boolean;
}

@Directive({
  selector: '[growthbook]',
  standalone: true,
})
export class GrowthBookDirective implements OnInit, OnDestroy {
  private featureKey: string = '';
  private growthbookSubscription$: Subscription = new Subscription();
  private initialized = false;

  @Input() set growthbook(input: { featureKey: string }) {
    this.featureKey = input.featureKey;
    if (this.initialized) {
      this.updateView();
    }
  }

  constructor(
    private templateRef: TemplateRef<GrowthBookContext>,
    private viewContainer: ViewContainerRef,
    private growthbookService: NgxGrowthbookService
  ) {}

  async ngOnInit(): Promise<void> {
    // Wait for GrowthBook to be initialized
    await this.waitForGrowthBook();
    
    this.initialized = true;
    this.updateView();
    
    this.growthbookSubscription$ = this.growthbookService.subscribe(() => {
      this.updateView();
    });
  }

  private async waitForGrowthBook(retries = 10): Promise<void> {
    if (this.growthbookService.growthBook) {
      return;
    }

    if (retries === 0) {
      console.error('GrowthBook failed to initialize after multiple attempts');
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 100));
    return this.waitForGrowthBook(retries - 1);
  }

  private updateView(): void {
    if (!this.growthbookService.growthBook) {
      this.viewContainer.clear();
      return;
    }

    const isEnabled = this.growthbookService.isOn(this.featureKey);
    this.viewContainer.clear();
    this.viewContainer.createEmbeddedView(this.templateRef, {
      isOn: isEnabled
    });
  }

  ngOnDestroy(): void {
    this.growthbookSubscription$.unsubscribe();
  }

  static ngTemplateContextGuard(
    dir: GrowthBookDirective,
    ctx: unknown
  ): ctx is GrowthBookContext {
    return true;
  }
}