import { Injectable } from '@angular/core';
import { BehaviorSubject, filter, Observable } from 'rxjs';
import Ammo from '../../../../node_modules/ammojs-typed/ammo/ammo';

@Injectable({
  providedIn: 'root'
})
export class AmmoService {
  private ammo: BehaviorSubject<any>;

  constructor() {
    this.ammo = new BehaviorSubject(null);
    import('../../../../node_modules/ammojs-typed/ammo/ammo') // use dynamic import
      .then((Module) => Module.default())
      .then((ammo) => {
        this.ammo.next(ammo);
      });
  }

  public get Ammo(): Observable<any> {
    return this.ammo.asObservable().pipe(filter((ammo) => ammo));
  }
}
