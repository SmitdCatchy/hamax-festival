import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  private fullscreenState: BehaviorSubject<boolean>;

  constructor() {
    this.fullscreenState = new BehaviorSubject<boolean>(false);
  }

  public toggleFullScreen(): void {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      this.fullscreenState.next(true);
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
      this.fullscreenState.next(false);
    }
  }
}
