import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { DataConnection, Peer } from 'peerjs';
import { Subject } from 'rxjs';
import { CoreService } from 'src/app/core/services/core.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { PeerState } from '../enums/peer-state.enum';
import { PeerType } from '../enums/peer-type.enum.ts';
import { BattlePeer } from '../models/battle-peer.model';
import { PeerData } from '../models/peer-data.model';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private _peer!: Peer;
  private _peerType!: PeerType;
  private _connections!: DataConnection[];
  private _peerId!: string;
  public peers!: BattlePeer[];
  private _peerState!: PeerState;
  public refreshUi: Subject<null>;
  public playerAction: Subject<any>;
  public disconnectedPeerIndex: Subject<number>;
  private interval: any;
  private heartbeatCheck: boolean;
  private heartbeatLength: number;

  constructor(
    private readonly core: CoreService,
    // private readonly popup: MatSnackBar,
    // private readonly dialog: MatDialog,
    private readonly translateService: TranslateService
  ) {
    this.heartbeatLength = 5000;
    this.peers = [];
    this.refreshUi = new Subject();
    this.playerAction = new Subject();
    this.disconnectedPeerIndex = new Subject();
    this.heartbeatCheck = false;
  }

  public initializePeer(): void {
    this.peers = [];
    this._connections = [];
    this._peerType = PeerType.Host;
    this._peer = new Peer({
      config: {
        iceServers: [
          { urls: ['stun:51.15.25.223:3478'] },
          {
            urls: ['turn:51.15.25.223:3478'],
            username: 'warcry',
            credential: 'companion'
          }
        ]
      }
    });
    this._peerState = PeerState.Unready;
    let peerIndex;
    this._peer.on('connection', (conn) => {
      conn.on('data', (data) => {
        switch ((data as PeerData).data.type) {
          case 'join':
            if (this.peers.findIndex((peer) => peer.peerId === conn.peer) < 0) {
              this.privateMessage(
                { peerId: this._peerId, data: { type: 'roster' } },
                conn.peer
              );
              const newPeer = (data as PeerData).data.peer as BattlePeer;
              console.log('multiplayer.dialog.peer-joined', { peer: newPeer });
              this.playerAction.next({
                changed: 'joined'
              });
              // this.dialog.open(ConfirmDialogComponent, {
              //   data: {
              //     confirmation: true,
              //     noLabel: 'common.ok',
              //     question: this.translateService.instant(
              //       'multiplayer.dialog.peer-joined',
              //       { peer: newPeer }
              //     )
              //   },
              //   closeOnNavigation: false
              // });
              newPeer.hostIndex = this.peers.length;
              this.peers.push(newPeer);
              this.refreshUi.next(null);
              this.broadcast({
                peerId: conn.peer,
                data: { type: 'join', peer: newPeer }
              });
            }
            break;
          case 'ready':
            peerIndex = this.peers.findIndex(
              (peer) => peer.peerId === (data as PeerData).peerId
            );
            if (peerIndex > -1) {
              this.peers[peerIndex].state = PeerState.Ready;
              this.refreshUi.next(null);
              this.broadcast(data as PeerData);
            }
            break;
          case 'unready':
            peerIndex = this.peers.findIndex(
              (peer) => peer.peerId === (data as PeerData).peerId
            );
            if (peerIndex > -1) {
              this.peers[peerIndex].state = PeerState.Unready;
              this.refreshUi.next(null);
              this.broadcast(data as PeerData);
            }
            break;
          case 'heartbeat':
            (conn as any).heartbeat = Date.now();
            this.privateMessage(
              { peerId: this.peerId, data: { type: 'heartbeat' } },
              conn.peer
            );
            if (!this.interval) {
              this.interval = setInterval(() => {
                const checkTimestamp = Date.now();
                this._connections.forEach((conn) => {
                  if (
                    (conn as any).heartbeat <
                    checkTimestamp - this.heartbeatLength * 2
                  ) {
                    let peerIndex = this.peers.findIndex(
                      (peer) => peer.peerId === conn.peer
                    );
                    this.disconnectedPeerIndex.next(peerIndex);
                    if (peerIndex > -1) {
                      console.log('multiplayer.dialog.peer-disconnected', {
                        peer: this.peers[peerIndex]
                      });
                      // this.dialog.open(ConfirmDialogComponent, {
                      //   data: {
                      //     confirmation: true,
                      //     noLabel: 'common.ok',
                      //     question: this.translateService.instant(
                      //       'multiplayer.dialog.peer-disconnected',
                      //       { peer: this.peers[peerIndex] }
                      //     )
                      //   },
                      //   closeOnNavigation: false
                      // });
                      this.peers.splice(peerIndex, 1);
                      this.broadcast({
                        peerId: this._peerId,
                        data: {
                          type: 'disconnected',
                          peer: conn.peer
                        }
                      });
                      this.refreshUi.next(null);
                    }
                    peerIndex = this._connections.findIndex(
                      (peer) => peer.peer === conn.peer
                    );
                    if (peerIndex > -1) {
                      this._connections.splice(peerIndex, 1);
                    }
                  }
                });
              }, this.heartbeatLength + 1000);
            }
            break;
          case 'state-change':
            this.handleStateChange(
              (data as PeerData).peerId,
              (data as PeerData).data
            );
            this.broadcast(data as PeerData);
            break;
          case 'disconnected':
            peerIndex = this.peers.findIndex(
              (peer) => peer.peerId === (data as PeerData).data.peer
            );
            if (peerIndex > -1) {
              this.peers.splice(peerIndex, 1);
              this.refreshUi.next(null);
            }
            break;
        }
      });
      conn.on('open', () => {
        this.privateMessage(
          {
            peerId: this._peerId,
            data: {
              type: 'session',
              peers: this.peers,
              hostState: this.peerState
            }
          },
          conn.peer
        );
      });
      conn.on('close', () => {
        const peerIndex = this.peers.findIndex(
          (peer) => peer.peerId === conn.peer
        );
        this.disconnectedPeerIndex.next(peerIndex);
        if (peerIndex > -1) {
          console.log('multiplayer.dialog.peer-disconnected', {
            peer: this.peers[peerIndex]
          });
          // this.dialog.open(ConfirmDialogComponent, {
          //   data: {
          //     confirmation: true,
          //     noLabel: 'common.ok',
          //     question: this.translateService.instant(
          //       'multiplayer.dialog.peer-disconnected',
          //       { peer: this.peers[peerIndex] }
          //     )
          //   },
          //   closeOnNavigation: false
          // });
          this.peers.splice(peerIndex, 1);
          this.broadcast({
            peerId: this._peerId,
            data: {
              type: 'disconnected',
              peer: conn.peer
            }
          });
          this.refreshUi.next(null);
        }
      });
      (conn as any).heartbeat = Date.now();
      this._connections.push(conn);
    });
    this._peer.on('open', (id) => {
      this._peerId = id;
    });
  }

  public connectPeer(peerId: string, connectedCb: () => any = () => {}): void {
    this.core.startLoader();
    let loaderFailSafe = true;
    let peerIndex;
    setTimeout(() => {
      if (loaderFailSafe) {
        this.core.stopLoader();
        // this.popup.open(
        //   `${this.translateService.instant('multiplayer.error.unable')}`,
        //   undefined,
        //   {
        //     horizontalPosition: 'center',
        //     verticalPosition: 'bottom',
        //     duration: 1000,
        //     panelClass: 'bottom-snackbar'
        //   }
        // );
        this.disconnect();
      }
    }, 5000);
    this._peerType = PeerType.Peer;
    this._connections = [];
    this.peers = [];
    const connection = this._peer.connect(peerId);
    connection.on('open', () => {
      loaderFailSafe = false;
      this.broadcast({
        peerId: this._peerId,
        data: {
          type: 'join',
          peer: {
            peerId: this._peerId,
            state: PeerState.Unready
          }
        }
      });
      this.interval = setInterval(() => {
        this.broadcast({ peerId: this.peerId, data: { type: 'heartbeat' } });
        this.heartbeatCheck = true;
        setTimeout(() => {
          if (this.heartbeatCheck) {
            this.disconnect();
          }
        }, 1000);
      }, this.heartbeatLength);
    });
    connection.on('close', () => {
      console.log('multiplayer.dialog.disconnected');
      // this.dialog.open(ConfirmDialogComponent, {
      //   data: {
      //     confirmation: true,
      //     noLabel: 'common.ok',
      //     question: this.translateService.instant(
      //       'multiplayer.dialog.disconnected'
      //     )
      //   },
      //   closeOnNavigation: false
      // });
      this.disconnectedPeerIndex.next(-1);
      this.disconnect();
    });
    connection.on('data', (data) => {
      if ((data as PeerData).peerId !== this._peerId) {
        switch ((data as PeerData).data.type) {
          case 'session':
            console.log('multiplayer.dialog.joined', {
              peer: (data as PeerData).data
            });
            // this.dialog.open(ConfirmDialogComponent, {
            //   data: {
            //     confirmation: true,
            //     noLabel: 'common.ok',
            //     question: this.translateService.instant(
            //       'multiplayer.dialog.joined',
            //       { peer: (data as PeerData).data }
            //     )
            //   },
            //   closeOnNavigation: false
            // });
            this.peers.push({
              peerId: connection.peer,
              state: (data as PeerData).data.hostState,
              type: PeerType.Host
            });
            this.peers.push(
              ...(data as PeerData).data.peers.filter(
                (peer: BattlePeer) => peer.peerId != this._peerId
              )
            );
            connectedCb();
            this.core.stopLoader();
            this.refreshUi.next(null);
            break;
          case 'join':
            console.log('multiplayer.dialog.peer-joined', {
              peer: (data as PeerData).data.peer
            });
            // this.dialog.open(ConfirmDialogComponent, {
            //   data: {
            //     confirmation: true,
            //     noLabel: 'common.ok',
            //     question: this.translateService.instant(
            //       'multiplayer.dialog.peer-joined',
            //       { peer: (data as PeerData).data.peer }
            //     )
            //   },
            //   closeOnNavigation: false
            // });
            this.peers.push((data as PeerData).data.peer);
            this.refreshUi.next(null);
            break;
          case 'ready':
            peerIndex = this.peers.findIndex(
              (peer) => peer.peerId === (data as PeerData).peerId
            );
            if (peerIndex > -1) {
              this.peers[peerIndex].state = PeerState.Ready;
              this.refreshUi.next(null);
            }
            break;
          case 'unready':
            peerIndex = this.peers.findIndex(
              (peer) => peer.peerId === (data as PeerData).peerId
            );
            if (peerIndex > -1) {
              this.peers[peerIndex].state = PeerState.Unready;
              this.refreshUi.next(null);
            }
            break;
          case 'heartbeat':
            this.heartbeatCheck = false;
            break;
          case 'state-change':
            this.handleStateChange(
              (data as PeerData).peerId,
              (data as PeerData).data
            );
            break;
          case 'disconnected':
            peerIndex = this.peers.findIndex(
              (peer) => peer.peerId === (data as PeerData).data.peer
            );
            this.disconnectedPeerIndex.next(peerIndex);
            if (peerIndex > -1) {
              console.log('multiplayer.dialog.peer-disconnected', {
                peer: this.peers[peerIndex]
              });
              // this.dialog.open(ConfirmDialogComponent, {
              //   data: {
              //     confirmation: true,
              //     noLabel: 'common.ok',
              //     question: this.translateService.instant(
              //       'multiplayer.dialog.peer-disconnected',
              //       { peer: this.peers[peerIndex] }
              //     )
              //   },
              //   closeOnNavigation: false
              // });
              this.peers.splice(peerIndex, 1);
              this.refreshUi.next(null);
            }
            break;
        }
      }
    });
    this._connections.push(connection);
  }

  public ready(): void {
    this._peerState = PeerState.Ready;
    this.broadcast({
      peerId: this.peerId,
      data: { type: 'ready' }
    });
  }

  public unready(): void {
    this._peerState = PeerState.Unready;
    this.broadcast({
      peerId: this.peerId,
      data: { type: 'unready' }
    });
  }

  public disconnect(): void {
    clearInterval(this.interval);
    this._peer.destroy();
    this.initializePeer();
    this.refreshUi.next(null);
  }

  public stateChange(change: any): void {
    // switch (change.type) {
    //   case 'end-turn':
    //     this._peerState = PeerState.Unready;
    //     this.peers.forEach((peer) => (peer.state = PeerState.Unready));
    //     break;
    // }
    this.broadcast({
      peerId: this.peerId,
      data: {
        type: 'state-change',
        ...change
      }
    });
    this.refreshUi.next(null);
  }

  private handleStateChange(peerId: string, change: any): void {
    let peerIndex;
    switch (change.changed) {
      case 'end-turn':
        this._peerState = PeerState.Unready;
        this.peers.forEach((peer) => (peer.state = PeerState.Unready));
        break;
      default:
        this.playerAction.next(change);
    }
  }

  public broadcast(message: PeerData): void {
    this._connections.forEach((connection) => {
      if (message.peerId !== connection.peer) {
        connection.send(message);
      }
    });
  }

  public privateMessage(message: PeerData, peer: string): void {
    const selected = this._connections.find(
      (connection) => peer === connection.peer
    );
    if (selected) {
      selected.send(message);
    }
  }

  public get peerId(): string {
    return this._peerId;
  }

  public get peerType(): string {
    return this._peerType;
  }

  public get host(): boolean {
    return this._peerType === PeerType.Host;
  }

  public get peerState(): PeerState {
    return this._peerState;
  }

  public get connected(): boolean {
    return this.peers.length > 0;
  }

  public get allReady(): boolean {
    return (
      this._peerState === PeerState.Ready &&
      this.peers.findIndex((peer) => peer.state === PeerState.Unready) === -1
    );
  }

  public get meReady(): boolean {
    return this._peerState === PeerState.Ready;
  }
}
