import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  constructor() {}

  public static log(label: string, message: any): void {
    if (!environment.production) {
      console.log(label, message);
    }
  }

  public static warn(label: string, message: any): void {
    if (!environment.production) {
      console.warn(label, message);
    }
  }

  public static err(label: string, message: any): void {
    console.error(label, message);
  }
}
