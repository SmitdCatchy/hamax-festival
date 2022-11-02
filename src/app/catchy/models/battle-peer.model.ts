import { PeerState } from '../enums/peer-state.enum';
import { PeerType } from '../enums/peer-type.enum.ts';

export interface BattlePeer {
  peerId: string;
  hostIndex?: number;
  type?: PeerType;
  state: PeerState;
}
