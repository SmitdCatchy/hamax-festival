import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  private fullscreenState: BehaviorSubject<boolean>;
  public _loader: boolean;

  constructor(private readonly translateService: TranslateService) {
    this.fullscreenState = new BehaviorSubject<boolean>(false);
    this._loader = false;
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

  public static getLocalStorage(key: string, missing: string = ''): string {
    return localStorage.getItem(key) || missing;
  }

  public static setLocalStorage(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  public static removeLocalStorage(key: string): void {
    localStorage.removeItem(key);
  }

  public startLoader(): void {
    this._loader = true;
  }

  public stopLoader(): void {
    this._loader = false;
  }

  public get loading(): boolean {
    return this._loader;
  }
}
