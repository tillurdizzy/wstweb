import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { SupabaseService } from '../../services/supabase.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-letter',
  standalone: true,
  imports: [CommonModule, CardModule, SafeUrlPipe],
  templateUrl: './letter.component.html',
  styleUrls: ['./letter.component.scss'],
})
export class LetterComponent implements OnInit {
  pdfPath: string | null = null;

  private supabaseService = inject(SupabaseService);

  async ngOnInit() {
    const { data, error } = await this.supabaseService.client
      .from('newsletters')
      .select('id, pdf_path')
      .order('id', { ascending: false })
      .limit(1);
    if (error) {
      console.error('Error fetching latest newsletter:', error.message);
    } else if (data && data.length > 0) {
      this.pdfPath = data[0].pdf_path;
    }
  }
}