import { Component } from '@angular/core';
import { SupabaseService } from '../services/supabase.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select'; // Add this
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule, // Add this
    FormsModule,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {
  unitNumber: number | null = null;
  searchName: string = '';
  searchResults: any[] = [];
  allUnits = [
    101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120,
    121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 136, 137, 138, 139, 140,
    200, 201, 202, 203, 204, 205, 206, 207, 208, 209, 210, 211, 212, 213, 214, 215, 216, 217, 218, 219,
    220, 221, 222, 223, 224, 225, 226, 227, 228, 229, 230, 231, 232, 233, 234, 235, 236, 300, 301, 302,
    303, 304, 305, 306, 307, 308, 309, 310, 311, 312, 313, 314, 315, 316, 317, 318, 319, 320, 321, 322,
    323, 324, 325, 326, 327, 328, 329, 330, 331, 332, 333, 334, 335, 336, 400, 401, 402, 403, 404, 405,
    406, 407, 408, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425,
    426, 500, 501, 502, 503, 504, 505, 506, 507, 508, 509, 510, 511, 512, 513, 514, 515, 516, 517, 518,
    519, 520, 521, 522, 523, 524, 525, 526, 527, 528, 529, 530, 531, 532, 533, 534, 535, 536, 537, 538,
    539, 540, 541, 542, 543, 544, 545, 546, 547, 548, 549, 550, 551, 552, 553
  ];

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  async goToUnit() {
    if (this.unitNumber !== null && this.allUnits.includes(this.unitNumber)) {
      this.router.navigate(['/units'], { queryParams: { unit: this.unitNumber } });
    } else {
      alert('Please select a valid unit number.');
    }
  }

  async searchOwners() {
    if (this.searchName.trim()) {
      const { data, error } = await this.supabaseService.client
        .from('owners')
        .select('owner_id, firstname, lastname, cell, email')
        .or(`firstname.ilike.%${this.searchName}%,lastname.ilike.%${this.searchName}%`);
      if (error) {
        console.error('Error searching owners:', error.message);
      } else {
        this.searchResults = data || [];
      }
    } else {
      this.searchResults = [];
    }
  }

  viewOwnerUnits(ownerId: string) {
    this.router.navigate(['/units'], { queryParams: { ownerId } });
  }
}