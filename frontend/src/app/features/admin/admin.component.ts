import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  users: any[] = [];
  stats: any = {};

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getAdminUsers().subscribe(d => this.users = d);
    this.api.getAdminStats().subscribe(d => this.stats = d);
  }
}
