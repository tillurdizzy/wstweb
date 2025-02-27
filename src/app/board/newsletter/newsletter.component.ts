import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { SupabaseService } from '../../services/supabase.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, MatCardModule, SafeUrlPipe], // Add the pipe
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.scss'],
})
export class NewsletterComponent implements OnInit {
  pdfPath: string | null = null;

  private supabaseService = inject(SupabaseService);

  async ngOnInit() {
    const { data, error } = await this.supabaseService.client
      .from('newsletters')
      .select('id, pdf_path')
      .order('id', { ascending: false }) // Get the latest by highest id
      .limit(1);
    if (error) {
      console.error('Error fetching latest newsletter:', error.message);
    } else if (data && data.length > 0) {
      this.pdfPath = data[0].pdf_path;
    }
  }
}