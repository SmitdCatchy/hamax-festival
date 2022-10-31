import { TestBed } from '@angular/core/testing';

import { AmmoService } from './ammo.service';

describe('AmmoService', () => {
  let service: AmmoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AmmoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
