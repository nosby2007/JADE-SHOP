import { Component, OnInit, ViewChild } from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { combineLatest } from 'rxjs';
import { AdminMetricsService } from 'src/app/admin/service/admin-metrics.service';

@Component({
  selector: 'app-admin-dashbord',
  templateUrl: './admin-dashbord.component.html',
  styleUrls: ['./admin-dashbord.component.scss']
})
export class AdminDashbordComponent implements OnInit {
  // KPIs
  totals = { users: 0, admins: 0, disabled: 0, logins7d: 0 };

  // Charts options
  rolePieOptions: any;
  providerBarOptions: any;
  loginsLineOptions: any;

  // Tables
  usersDS = new MatTableDataSource<any>([]);
  errorsDS = new MatTableDataSource<any>([]);
  userCols = ['displayName','email','role','status','lastLogin'];
  errCols = ['ts','level','message'];

  @ViewChild('usersPaginator') usersPaginator!: MatPaginator;
  @ViewChild('errorsPaginator') errorsPaginator!: MatPaginator;

  loading = true;

  constructor(private m: AdminMetricsService) {}

  ngOnInit(): void {
    // KPIs
    combineLatest([this.m.usersCount$, this.m.adminsCount$, this.m.disabledCount$, this.m.logins7d$])
      .subscribe(([users, admins, disabled, logins7d]) => {
        this.totals = { users, admins, disabled, logins7d };
      });

    // Charts
    this.m.roleDist$.subscribe(data => {
      this.rolePieOptions = {
        tooltip: { trigger: 'item' },
        series: [{
          name: 'Rôles',
          type: 'pie',
          radius: ['40%','70%'],
          roseType: false,
          avoidLabelOverlap: true,
          itemStyle: { borderRadius: 6, borderColor: '#fff', borderWidth: 2 },
          data
        }]
      };
    });

    this.m.providerDist$.subscribe(({ labels, values }) => {
      this.providerBarOptions = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: labels },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: values }]
      };
    });

    this.m.logins14dSeries$.subscribe(({ days, series }) => {
      this.loginsLineOptions = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: days },
        yAxis: { type: 'value' },
        series: [{ type: 'line', data: series, smooth: true, areaStyle: {} }]
      };
    });

    // Tables
    this.m.latestUsers$.subscribe(items => {
      this.usersDS.data = items ?? [];
      if (this.usersPaginator) this.usersDS.paginator = this.usersPaginator;
      this.loading = false;
    });

    this.m.errors$.subscribe(items => {
      const mapped = (items ?? []).map(e => ({
        ts: e.ts?.toDate?.() ?? e.ts,
        level: e.level ?? e.severity ?? 'error',
        message: e.message || e.msg || '(no message)'
      }));
      this.errorsDS.data = mapped;
      if (this.errorsPaginator) this.errorsDS.paginator = this.errorsPaginator;
    });
  }

  toDate(v: any): Date | null {
    const d = v?.toDate?.() ?? v;
    return d instanceof Date ? d : null;
  }
}
