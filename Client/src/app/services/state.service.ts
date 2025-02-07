import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private hiddenSubject = new BehaviorSubject<boolean>(false);  // Početno stanje je false
  hidden$ = this.hiddenSubject.asObservable();

  setHiddenState(hidden: boolean) {
    localStorage.setItem('hidden', hidden ? 'hidden' : '');
    this.hiddenSubject.next(hidden);  // Emituj novu vrednost
  }

  getHiddenState() {
    const hid = localStorage.getItem('hidden');
    return hid === 'hidden';
  }
}
