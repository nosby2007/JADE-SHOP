import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdminUserService, AppUser } from '../../services/admin-user.service';
import { Observable } from 'rxjs';
import { AddUserDialogComponent } from '../../components/add-user-dialog/add-user-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-admin-user-list',
  templateUrl: './admin-user-list.component.html',
  styleUrls: ['./admin-user-list.component.scss']
})
export class AdminUserListComponent {
  dataSource = new MatTableDataSource<AppUser>([]);
displayed = ['displayName','email','roles','actions'];
  users$!: Observable<AppUser[]>;

  constructor(private svc: AdminUserService, private dialog: MatDialog, private sb: MatSnackBar) {
    this.users$ = this.svc.listUsers();
  }
  ngOnInit() {
    this.users$ = this.svc.listUsers();
    this.users$.subscribe(users => {
      this.dataSource.data = users ?? []; // jamais null
    });
  }

  openAddUser() {
    const ref = this.dialog.open(AddUserDialogComponent, { width: '520px' });
    ref.afterClosed().subscribe(res => {
      if (res?.ok) this.sb.open('User created', 'OK', { duration: 2500 });
    });
  }

  async makeAdmin(u: AppUser) {
    await this.svc.setRoles(u.uid, ['admin']);
    this.sb.open('Roles updated to admin', 'OK', { duration: 2500 });
  }

  async setRoles(u: AppUser, roles: string[]) {
    await this.svc.setRoles(u.uid, roles);
    this.sb.open('Roles updated', 'OK', { duration: 2500 });
  }
}
