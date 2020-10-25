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

  private _is_menu_expanded: boolean = false;
  private _is_handset: boolean = false;
  private _is_settings_expanded: boolean = false;

  public isHandset$: Observable<boolean> =
    this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );


  constructor(private breakpointObserver: BreakpointObserver) {
    this.isHandset$.subscribe({
      next: (result: boolean) => {
        this._is_handset = result;
      }
    });
  }

  public toggleMenu(): void {
    this._is_menu_expanded = !this._is_menu_expanded;
  }

  public isExpanded(): boolean {
    return this._is_menu_expanded || this._is_handset;
  }

  public toggleSettings(): void {
    this._is_settings_expanded = !this._is_settings_expanded;
  }

  public isSettingsExpanded(): boolean {
    return this._is_settings_expanded;
  }
}
