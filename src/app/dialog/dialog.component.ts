import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogTitle, MatDialogContent, MatDialogActions } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogTitle, MatDialogContent, MatDialogActions, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Success</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
  styles: [`
    :host {
      display: block;
      width: 300px;
    }
  `],
})
export class DialogComponent {
  readonly dialogRef = inject(MatDialogRef<DialogComponent>);
  public data = inject(MAT_DIALOG_DATA); // Inject data with token

  constructor() {
    // Auto-close after 2 seconds
    setTimeout(() => {
      this.dialogRef.close();
    }, 2000);
  }
}