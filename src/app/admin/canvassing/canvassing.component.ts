import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { SHARES } from './voting-shares';

@Component({
  selector: 'app-canvassing',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, DialogModule, FormsModule],
  templateUrl: './canvassing.component.html',
  styleUrls: ['./canvassing.component.scss'],
})
export class CanvassingComponent implements OnInit {
  groups = [
    { label: '100s', from: 100, to: 199 },
    { label: '200s', from: 200, to: 299 },
    { label: '300s', from: 300, to: 399 },
    { label: '400s', from: 400, to: 499 },
    { label: '500s', from: 500, to: 599 },
  ];
  contactChoices = [
    'Try again later',
    'FOR Us - Vote in person',
    'FOR Us - Proxy promised',
    'Proxy collected',
    'AGAINST Us',
    'Reset',
  ];
  group = this.groups[0];
  rows: { unit: number | null; label: string; note: string; vote: string; proxy: string }[] = [];
  noteVisible = false;
  noteText = '';
  forPercent = '0.0';
  activeUnit: number | null = null;
  contactChoice: string | null = null;
  contactNote = '';
  contactMessage = '';
  savingContact = false;
  signedInEmail = '';
  savedVisible = false;

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    const { data: user } = await this.supabase.getUser();
    this.signedInEmail = user?.user?.email || '';
    await this.load();
  }

  async load() {
    const { data: all, error: allError } = await this.supabase.client
      .from('election')
      .select('unit, vote');
    if (!allError) this.forPercent = this.percentFor(all || []);

    const { data, error } = await this.supabase.client
      .from('election')
      .select('unit, name, notes, vote, proxy')
      .gte('unit', this.group.from)
      .lte('unit', this.group.to)
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
      vote: row.vote || '',
      proxy: row.proxy || '',
    }));
  }

  openUnit(unit: number | null) {
    if (unit == null) return;
    this.router.navigate(['/admin/unit-search'], { queryParams: { unit } });
  }

  async showNote(row: { unit: number | null; note: string }) {
    this.activeUnit = row.unit;
    this.noteText = row.note || 'No note yet.';
    this.contactChoice = null;
    this.contactNote = '';
    this.contactMessage = '';
    this.noteVisible = true;
    if (row.unit == null) return;

    const { data } = await this.supabase.client
      .from('election')
      .select('vote, proxy')
      .eq('unit', row.unit)
      .maybeSingle();
    this.contactChoice = this.choiceFromRow(data?.vote, data?.proxy);
  }

  async saveContact() {
    if (this.activeUnit == null) return;
    const note = (this.contactNote || '').trim();
    if (!this.contactChoice && !note) {
      this.contactMessage = 'Choose a result or enter a note.';
      return;
    }

    this.savingContact = true;
    this.contactMessage = '';

    const today = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const what = [this.contactChoice, note].filter(Boolean).join(' — ');
    const block = [
      `Date: ${today}`,
      `User: ${this.signedInEmail || 'unknown'}`,
      `Note: ${what}`,
    ].join('\n');
    const history = this.noteText && this.noteText !== 'No note yet.'
      ? `${this.noteText}\n\n${block}`
      : block;

    const patch: any = { notes: history };
    if (this.contactChoice && this.contactChoice !== 'Try again later') {
      const mapped = this.voteProxyFor(this.contactChoice);
      patch.vote = mapped.vote;
      patch.proxy = mapped.proxy;
    }

    const { error } = await this.supabase.client
      .from('election')
      .update(patch)
      .eq('unit', this.activeUnit);

    this.savingContact = false;
    if (error) {
      this.contactMessage = error.message;
      return;
    }

    this.noteText = history;
    this.contactNote = '';
    if (this.contactChoice === 'Reset') this.contactChoice = null;
        this.noteVisible = false;
      this.contactNote = '';
    if (this.contactChoice === 'Reset') this.contactChoice = null;
      this.savedVisible = true;
    await this.load();
  }

  voteMark(vote: string, proxy: string): { icon: string; tone: string } | null {
    if (vote === 'AGAINST') return { icon: 'pi pi-times', tone: 'red' };
    if (vote !== 'FOR') return null;
    if (proxy === 'Collected') return { icon: 'pi pi-check-square', tone: 'green' };
    if (proxy === 'Promised') return { icon: 'pi pi-check', tone: 'orange' };
    return { icon: 'pi pi-check', tone: 'green' };
  }

  sameGroup = (a: any, b: any) => a?.label === b?.label;

  private percentFor(rows: { unit: number | null; vote: string | null }[]): string {
    let total = 0;
    let forShares = 0;
    for (const row of rows) {
      const share = row.unit != null ? SHARES[row.unit] : 0;
      if (!share) continue;
      total += share;
      if (row.vote === 'FOR') forShares += share;
    }
    return total ? ((forShares / total) * 100).toFixed(1) : '0.0';
  }

  private lastNote(notes: string | null): string {
    if (!notes) return '';
    const parts = notes.split(/\n\n+/).filter(Boolean);
    return parts[parts.length - 1] || '';
  }

private voteProxyFor(choice: string | null): { vote: string | null; proxy: string | null } {
  switch (choice) {
    case 'FOR Us - Vote in person':
      return { vote: 'FOR', proxy: 'NA' };
    case 'FOR Us - Proxy promised':
      return { vote: 'FOR', proxy: 'Promised' };
    case 'Proxy collected':
      return { vote: 'FOR', proxy: 'Collected' };
    case 'AGAINST Us':
      return { vote: 'AGAINST', proxy: null };
    case 'Reset':
      return { vote: null, proxy: null };
    default:
      return { vote: null, proxy: null };
  }
}

private choiceFromRow(vote: string | null, proxy: string | null): string | null {
  if (proxy === 'Collected') return 'Proxy collected';
  if (proxy === 'Promised') return 'FOR Us - Proxy promised';
  if (vote === 'FOR') return 'FOR Us - Vote in person';
  if (vote === 'AGAINST') return 'AGAINST Us';
  return null;
}
}