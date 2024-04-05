use anchor_lang::prelude::*;

/// instructions
pub mod instructions;
pub mod constants;
pub mod errors;
pub mod states;
use crate::instructions::*;

declare_id!("GkXe5pvp1127uBy6a1LaT3yXM8PRwTNBJsQsLKBENqeE");

#[program]
pub mod training {
    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        collection:Pubkey,
        role:Pubkey
    ) -> Result<()>{
        Initialize::validate(ctx,collection,role)?;
        Ok(())
    }
    pub fn change_admin(ctx: Context<TreasureSettings>,new_admin:Pubkey) -> Result<()>{
        TreasureSettings::change_admin(ctx,new_admin)?;
        Ok(())
    }

    pub fn change_collection(
        ctx: Context<TreasureSettings>,
        new_collection:Pubkey
    ) -> Result<()>{
        TreasureSettings::change_collection(ctx,new_collection)?;
        Ok(())
    }

    pub fn change_interval(
        ctx: Context<TreasureSettings>,
        interval:u64
    ) -> Result<()> {
        TreasureSettings::change_interval(ctx, interval)?;
        Ok(())
    }
    pub fn staking(ctx: Context<Staking>,_bump:u8) -> Result<()> {
        staking::staking(ctx, _bump)?;
        Ok(())
    }
    pub fn unstaking(ctx: Context<UnStaking>,_bump:u8) -> Result<()> {
        staking::unstaking(ctx, _bump)?;
        Ok(())
    }
    pub fn distribution(ctx: Context<Distribution>,payer: Pubkey,_bump:u8) -> Result<()> {
        distribution::distribution(ctx, payer, _bump)?;
        Ok(())
    }
}