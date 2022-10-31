import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'smitd-game-hud',
  templateUrl: './game-hud.component.html',
  styleUrls: ['./game-hud.component.scss']
})
export class GameHudComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  @HostListener('mousedown', ['$event']) public onClick(event: any): void {
    event.stopPropagation();
  }

  @HostListener('mouseup', ['$event']) public onClickEnd(event: any): void {
    event.stopPropagation();
  }

  @HostListener('mousemove', ['$event']) public onMouseMove(event: any): void {
    event.stopPropagation();
  }

  @HostListener('wheel', ['$event']) public onWheel(event: any): void {
    event.stopPropagation();
  }
}
