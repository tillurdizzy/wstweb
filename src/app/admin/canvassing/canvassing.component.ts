import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';

const SHARES: Record<number, number> = {
  101:0.38,102:0.38,103:0.38,104:0.38,105:0.38,106:0.38,107:0.38,108:0.38,109:0.38,110:0.38,111:0.38,112:0.38,
  113:0.33,114:0.33,115:0.33,116:0.33,117:0.38,118:0.33,119:0.38,120:0.38,121:0.38,122:0.38,123:0.38,124:0.38,
  125:0.38,126:0.38,127:0.38,128:0.38,129:0.38,130:0.38,131:0.33,132:0.33,133:0.33,134:0.33,135:0.33,136:0.33,
  137:0.38,138:0.38,139:0.38,140:0.38,200:0.34,201:0.38,202:0.38,203:0.38,204:0.38,205:0.38,206:0.52,207:0.52,
  208:0.38,209:0.38,210:0.38,211:0.38,212:0.38,213:0.33,214:0.33,215:0.33,216:0.33,217:0.38,218:0.33,219:0.38,
  220:0.38,221:0.38,222:0.38,223:0.38,224:0.44,225:0.44,226:0.38,227:0.38,228:0.38,229:0.38,230:0.38,231:0.33,
  232:0.33,233:0.33,234:0.33,235:0.33,236:0.33,300:0.6,301:0.6,302:0.6,303:0.6,304:0.6,305:0.67,306:0.67,
  307:0.67,308:0.9,309:0.9,310:0.38,311:0.38,312:0.38,313:0.38,314:0.38,315:0.38,316:0.38,317:0.38,318:0.38,
  319:0.38,320:0.38,321:0.38,322:0.38,323:0.38,324:0.38,325:0.38,326:0.38,327:0.38,328:0.38,329:0.38,330:0.6,
  331:0.6,332:0.6,333:0.6,334:0.6,335:0.6,336:0.94,400:0.67,401:0.67,402:0.67,403:0.67,404:0.67,405:0.6,
  406:0.6,407:0.6,408:0.57,409:0.57,410:0.57,411:0.57,412:0.32,413:0.9,414:0.6,415:0.6,416:0.6,417:0.6,
  418:0.67,419:0.67,420:0.6,421:0.94,422:0.6,423:0.6,424:0.6,425:0.6,426:0.6,500:0.6,501:0.6,502:0.6,503:0.6,
  504:0.67,505:0.67,506:0.9,507:0.67,508:0.67,509:0.67,510:0.67,511:0.7,512:0.67,513:0.67,514:0.67,515:0.67,
  516:0.66,517:0.6,518:0.71,519:0.64,520:0.6,521:0.6,522:0.6,523:0.6,524:0.7,525:0.67,526:0.67,527:0.67,
  528:0.67,529:0.67,530:0.9,531:0.67,532:0.6,533:0.6,534:0.6,535:0.6,536:0.67,537:0.67,538:0.67,539:0.67,
  540:0.6,541:0.76,542:0.76,543:0.6,544:0.67,545:0.67,546:0.67,547:0.67,548:0.6,549:0.6,550:0.6,551:0.6,
  552:0.67,553:0.9,
};

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
  group = this.groups[0];
  rows: { unit: number | null; label: string; note: string; vote: string }[] = [];
  noteVisible = false;
  noteText = '';
  forPercent = '0.0';

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  async ngOnInit() {
    await this.load();
  }

  async load() {
    const { data: all, error: allError } = await this.supabase.client
      .from('election')
      .select('unit, vote');
    if (!allError) this.forPercent = this.percentFor(all || []);

    const { data, error } = await this.supabase.client
      .from('election')
      .select('unit, name, notes, vote')
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

  voteIcon(vote: string): string {
    if (!vote) return '';
    return vote === 'AGAINST' ? 'pi pi-times-circle' : 'pi pi-check-circle';
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
    const last = parts[parts.length - 1] || '';
    const date = last.split('\n').find((l) => l.startsWith('Date:')) || '';
    const user = last.split('\n').find((l) => l.startsWith('User:')) || '';
    const note = last.split('\n').find((l) => l.startsWith('Note:')) || '';
    return [date, user, note].filter(Boolean).join('\n') || last;
  }
}