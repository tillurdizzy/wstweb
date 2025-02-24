import { Component, OnInit } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatListModule],
  template: `
    <mat-card>
      <mat-card-title>All Owners</mat-card-title>
      <mat-card-content>
        <mat-list *ngIf="owners.length > 0; else noOwners">
          <mat-list-item *ngFor="let owner of owners">
            {{ owner.email }} ({{ owner.owner_id }}) - Admin: {{ owner.is_admin ? 'Yes' : 'No' }}
          </mat-list-item>
        </mat-list>
        <ng-template #noOwners>
          <p>No owners found.</p>
        </ng-template>
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      mat-card {
        margin: 10px;
      }
      mat-list-item {
        padding: 8px 0;
      }
    `,
  ],
})
export class AdminComponent implements OnInit {
  owners: any[] = [];

  constructor(private supabaseService: SupabaseService) {}

  async ngOnInit() {
    if (await this.supabaseService.isAdmin()) {
      const { data, error } = await this.supabaseService.client
        .from('owners')
        .select('owner_id, email, is_admin');
      if (error) {
        console.error('Error fetching owners:', error.message);
      } else {
        this.owners = data || [];
      }
    }
  }
}