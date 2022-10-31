import { Injectable } from '@angular/core';

export enum Tracks {
  idle = 'idle',
  danger = 'danger'
}

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private soundAudio: HTMLAudioElement;
  private clickAudio: HTMLAudioElement;
  private idleTrack!: HTMLAudioElement;
  private dangerTrack!: HTMLAudioElement;
  private currentTrack: string;
  private initialized: boolean;

  constructor() {
    this.clickAudio = new Audio('assets/sounds/click.wav');
    this.soundAudio = new Audio('assets/sounds/bungalo.wav');
    // this.clickAudio.oncanplaythrough = () => { // check if audio is loaded
    //   console.log('loaded')
    // }
    this.clickAudio.loop = false;
    this.initialized = false;
    this.currentTrack = Tracks.idle;
  }

  public click(): void {
    this.clickAudio.currentTime = 0;
    this.clickAudio.play();
  }

  public sound(audio: string = 'bungalo.wav'): void {
    this.soundAudio = new Audio(`assets/sounds/${audio}`);
    this.soundAudio.currentTime = 0;
    this.soundAudio.play();
  }

  public initTracks(): void {
    if (this.initialized) return;
    this.idleTrack = new Audio();
    this.initTrack(this.idleTrack, '../assets/sounds/idle.mp3', 0.5);
    this.dangerTrack = new Audio();
    this.initTrack(this.dangerTrack, '../assets/sounds/danger.mp3', 0);
    this.initialized = true;
  }

  private initTrack(
    track: HTMLAudioElement,
    src: string,
    volume: number = 0.5
  ): void {
    track.volume = volume;
    track.loop = true;
    track.src = src;
    track.addEventListener('timeupdate', function () {
      var buffer = 0.1;
      if (this.currentTime > this.duration - buffer) {
        this.currentTime = 0;
        this.play();
      }
    });
    track.play();
  }

  public muteTrack(track: Tracks = Tracks.idle): void {
    this[`${track}Track`].volume = 0;
  }

  public toggleTrack(track: Tracks = Tracks.idle): void {
    if (this.currentTrack === Tracks[track]) {
      return;
    }
    const previousTrack = this.currentTrack;
    this.currentTrack = Tracks[track];
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        this[`${track}Track`].volume = i * 0.1;
      }, i * 200);
    }
    switch (previousTrack) {
      case Tracks.danger:
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            this.dangerTrack.volume = i * 0.1;
          }, 1000 + i * -200);
        }
        break;
      default:
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            this.idleTrack.volume = i * 0.1;
          }, 1000 + i * -200);
        }
        break;
    }
  }
}
