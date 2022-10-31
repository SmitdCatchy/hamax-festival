import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { SoundService } from 'src/app/core/services/sound.service';

@Directive({
  selector: '[smitd-click-sound]'
})
export class ClickSoundDirective {
  @Input() public soundSource?: string;

  constructor(
    private element: ElementRef,
    private readonly soundService: SoundService
  ) {}

  @HostListener('mousedown') onClick() {
    if (this.soundSource) {
      this.soundService.sound(this.soundSource)
    } else {
      this.soundService.click();
    }
  }
}
