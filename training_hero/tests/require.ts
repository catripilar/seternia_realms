import { PublicKey } from '@solana/web3.js';
import BN from "bn.js";

export interface Treasure {
    admin: PublicKey;
    collection: PublicKey;
    interval: BN;
}

export interface CoinStaking {
    mint: PublicKey;
    owner: PublicKey;
    timestamp: BN;
    amount: BN;
}

export interface Role {
    addresses: Array<PublicKey>;
}