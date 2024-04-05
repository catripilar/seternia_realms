use anchor_lang::prelude::*;

#[account]
pub struct Treasure {
    pub admin: Pubkey,
    pub collection: Pubkey,
    pub interval:u64
}

#[account]
pub struct CoinStaking {
    pub mint:Pubkey,
    pub owner:Pubkey,
    pub timestamp:u64,
    pub amount:u64
}
#[account]
pub struct Role {
    pub addresses:Vec<Pubkey>
}