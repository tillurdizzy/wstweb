import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UnitService {
  private selectedUnitSubject = new BehaviorSubject<number | null>(null);
  selectedUnit$ = this.selectedUnitSubject.asObservable();

  setSelectedUnit(unit: number | null) {
    this.selectedUnitSubject.next(unit);
  }

  getSelectedUnit(): number | null {
    return this.selectedUnitSubject.value;
  }
}