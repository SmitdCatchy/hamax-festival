import { Component } from '@angular/core';
import { CoreService } from './core/services/core.service';
import { TranslationService } from './core/services/translation.service';

@Component({
  selector: 'smitd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private readonly core: CoreService,
    private readonly translationService: TranslationService
  ) {}
}
