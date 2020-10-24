import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardTabsComponent } from './dashboard-tabs/dashboard-tabs.component';

const routes: Routes = [
  { path: "tabs", component: DashboardTabsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
