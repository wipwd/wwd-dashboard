import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

  private isHandset: boolean = false;
  public isHandset$: Observable<boolean> =
    this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  public isMenuExpanded: boolean = false;

  constructor(private breakpointObserver: BreakpointObserver) {
    this.isHandset$.subscribe({
      next: (result: boolean) => {
        this.isHandset = result;
      }
    });
  }

  public toggleMenu(): void {
    this.isMenuExpanded = !this.isMenuExpanded;
  }

  public isExpanded(): boolean {
    return this.isMenuExpanded || this.isHandset;
  }

}
