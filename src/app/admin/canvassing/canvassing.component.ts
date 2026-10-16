import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-canvassing',
  standalone: true,
  imports: [CommonModule, CardModule, FormsModule],
  templateUrl: './canvassing.component.html',
  styleUrls: ['./canvassing.component.scss'],
})
export class CanvassingComponent implements OnInit {
  groups = ['A', 'B', 'C', 'D', 'E', 'F'];
  group = 'A';
  startDate: string | null = null;
  rows: { unit: number | null; name: string; note: string }[] = [];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    const { data: campaign } = await this.supabase.client
      .from('campaign')
      .select('start_date')
      .eq('id', 1)
      .maybeSingle();
    this.startDate = campaign?.start_date || null;
    const start = this.startDate ? new Date(this.startDate + 'T00:00:00') : null;

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

    this.rows = (data || [])
      .filter((row: any) => !this.notedSince(row.notes, start))
      .map((row: any) => ({
        unit: row.unit,
        name: row.name || '',
        note: this.lastNote(row.notes),
      }));
  }

  private notedSince(notes: string | null, start: Date | null): boolean {
    if (!notes || !start) return false;
    const dates = [...notes.matchAll(/Date:\s*([A-Za-z]+ \d{1,2}, \d{4})/g)]
      .map((m) => new Date(m[1]));
    if (!dates.length) return false;
    const last = dates[dates.length - 1];
    return last >= start;
  }

  private lastNote(notes: string | null): string {
    if (!notes) return '';
    const parts = notes.split(/\n\n+/);
    const last = parts[parts.length - 1] || '';
    const note = last.split('\n').find((line) => line.startsWith('Note:'));
    return note ? note.replace(/^Note:\s*/, '') : '';
  }
}