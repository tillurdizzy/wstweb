import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-canvassing',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DialogModule, FormsModule],
  templateUrl: './canvassing.component.html',
  styleUrls: ['./canvassing.component.scss'],
})
export class CanvassingComponent implements OnInit {
  groups = ['A', 'B', 'C', 'D', 'E', 'F'];
  group = 'A';
  rows: { unit: number | null; label: string; note: string }[] = [];
  noteVisible = false;
  noteText = '';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    const { data, error } = await this.supabase.client
      .from('election')
      .select('unit, name, notes, vote, group')
      .eq('group', this.group)
      .is('vote', null)
      .order('unit');
    if (error) {
      console.error(error.message);
      this.rows = [];
      return;
    }

    this.rows = (data || []).map((row: any) => ({
      unit: row.unit,
      label: `${row.unit ?? ''} - ${row.name || ''}`.trim(),
      note: this.lastNote(row.notes),
    }));
  }

  openUnit(unit: number | null) {
    if (unit == null) return;
    this.router.navigate(['/admin/unit-search'], { queryParams: { unit } });
  }

  showNote(note: string) {
    this.noteText = note || 'No note yet.';
    this.noteVisible = true;
  }

  private lastNote(notes: string | null): string {
    if (!notes) return '';
    const parts = notes.split(/\n\n+/);
    const last = parts[parts.length - 1] || '';
    const line = last.split('\n').find((l) => l.startsWith('Note:'));
    return line ? line.replace(/^Note:\s*/, '') : last;
  }
}