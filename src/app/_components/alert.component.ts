import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {Alert, AlertType} from "@app/_models";
import {Subscription} from "rxjs";
import {AlertService} from "@app/_services/alert.service";
import {NavigationStart, Router} from "@angular/router";

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit, OnDestroy {
  @Input() id = 'default-alert';
  @Input() fade = true;
  alerts: Alert[] = [];
  alertSubscription: Subscription;
  routeSubscription: Subscription;

  constructor(private router: Router, private alertService: AlertService) { }

  ngOnInit(): void {
    this.alertSubscription = this.alertService.onAlert(this.id)
        .subscribe(alert => {
          // clear alerts when an empty alert is received
          if(!alert.message){
            // filter out alerts without 'keepAfterRouteChange' flag
            this.alerts = this.alerts.filter(x => x.keepAfterRouteChange);

            // remove 'keepAfterRouteChange' flag on the rest
            this.alerts.forEach(x => delete x.keepAfterRouteChange);
            return;
          }

          // add alert to array
          this.alerts.push(alert);

          // auto close alert if required
          if (alert.autoClose) {
            setTimeout(() => this.removeAlert(alert), 3000);
          }
        });

    //client alerts on location change
    this.routeSubscription = this.router.events.subscribe(event => {
      if(event instanceof NavigationStart){
        this.alertService.clear(this.id);
      }
    })
  }

  ngOnDestroy(): void {
    this.alertSubscription.unsubscribe();
    this.routeSubscription.unsubscribe();
  }

  removeAlert(alert: Alert){
    if (!this.alerts.includes(alert)) return;
    if (this.fade) {
      this.alerts.find(x => x === alert).fade = true;
      setTimeout(()=> {
        this.alerts = this.alerts.filter(x => x !== alert);
      }, 250)
    } else {
      this.alerts = this.alerts.filter(x => x !== alert);
    }
  }

  cssClass(alert: Alert){
    if (!alert) {
      return;
    }

    const classes = ['alert', 'alert-dismissible', 'mt-4', 'container'];

    const alertTypeClass = {
      [AlertType.Success]: 'alert alert-success',
      [AlertType.Error]: 'alert alert-danger',
      [AlertType.Info]: 'alert alert-info',
      [AlertType.Warning]: 'alert alert-warning'
    }

    classes.push(alertTypeClass[alert.type]);

    if (alert.fade) {
      classes.push('fade');
    }

    return classes.join(' ');
  }

}
