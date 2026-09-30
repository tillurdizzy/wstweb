import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

const WHATSAPP_GROUP = 'https://chat.whatsapp.com/Djc20BSdK3g2frto7Zv1bL';

@Component({
  selector: 'app-whatsapp',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './whatsapp.component.html',
  styleUrls: ['./whatsapp.component.scss'],
})
export class WhatsappComponent {
  joinOnThisPhone() {
    window.location.href = WHATSAPP_GROUP;
  }
}