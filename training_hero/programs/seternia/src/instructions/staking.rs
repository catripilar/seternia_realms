use anchor_lang::prelude::*;
use anchor_spl::{token::{Transfer,TokenAccount, Mint, Token}, associated_token::AssociatedToken};
use anchor_spl::metadata::{
    Metadata,MetadataAccount
};
use std::mem::size_of;
use crate::{constants::*, states::*,errors::*};

pub fn staking(ctx: Context<Staking>,_bump:u8) -> Result<()> {
    let accts: &mut Staking<'_> = ctx.accounts;
    let program = accts.token_program.clone();
    let collection = accts.metadata.collection.clone();
    let timestamp: u64 = Clock::get()?.unix_timestamp as u64;

    let binding = _bump.to_le_bytes();

    let seeds: &[&[&[u8]]] = &[&[
        TRESURE_SEED.as_ref(),
        binding.as_ref()
    ]];

    accts.staking.owner = accts.payer.key();
    accts.staking.mint = accts.mint.key();
    accts.staking.timestamp = timestamp;

    if !collection.clone().ok_or(CustomError::EmptyData)?.verified 
    || accts.associated.amount == 0
    || accts.mint.key() != accts.associated.mint
    || accts.payer.owner.key() != accts.associated.owner
    || collection.ok_or(CustomError::EmptyData)?.key != accts.treasure.collection{
        return Err(CustomError::IncorrectNFT.into());
    }

    let cpi_deposit  = CpiContext::new_with_signer(
        program.to_account_info(), 
        Transfer{
            from:ctx.accounts.associated.to_account_info(),
            to:ctx.accounts.local_associated.to_account_info(),
            authority:ctx.accounts.payer.to_account_info()
        },
        seeds
    );
    let _ =  anchor_spl::token::transfer(cpi_deposit, 1)?;

    Ok(())
}
pub fn unstaking(ctx: Context<UnStaking>,_bump:u8) -> Result<()> {
    let accts: &mut UnStaking<'_> = ctx.accounts;
    let program = accts.token_program.clone();
    let collection = accts.metadata.collection.clone();
    let timestamp: u64 = Clock::get()?.unix_timestamp as u64;

    let binding = _bump.to_le_bytes();

    let seeds: &[&[&[u8]]] = &[&[
        TRESURE_SEED.as_ref(),
        binding.as_ref()
    ]];

    if accts.staking.owner != accts.payer.owner.key(){
        return Err(CustomError::Unauthorized.into());
    }
    if timestamp > accts.staking.timestamp{
        return Err(CustomError::IncorrectTime.into());
    }
    if !collection.clone().ok_or(CustomError::EmptyData)?.verified 
    || accts.local_associated.amount == 0{
        return Err(CustomError::IncorrectNFT.into());
    }

    let amount = (timestamp.checked_sub(accts.staking.timestamp).ok_or(CustomError::MathOverflow)?)
    .checked_div(accts.treasure.interval).ok_or(CustomError::MathOverflow)?;

    accts.staking.amount += amount;
    accts.staking.timestamp = 0;

    let cpi_withdraw  = CpiContext::new_with_signer(
        program.to_account_info(), 
        Transfer{
            from:ctx.accounts.local_associated.to_account_info(),
            to:ctx.accounts.associated.to_account_info(),
            authority:ctx.accounts.treasure.to_account_info()
        },
        seeds
    );
    let _ =  anchor_spl::token::transfer(cpi_withdraw, 1)?;
    Ok(())
}

#[derive(Accounts)]
pub struct Staking<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init_if_needed,
        payer = payer,
        space = 16 + size_of::<CoinStaking>(),
        seeds = [STAKING_SEED,mint.key().as_ref()], 
        bump,
    )]
    pub staking: Account<'info, CoinStaking>,

    #[account(
        seeds = [TRESURE_SEED],
        bump,
    )]
    pub treasure: Box<Account<'info, Treasure>>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = treasure,
    )]
    pub local_associated: Account<'info, TokenAccount>,

    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub associated: Account<'info, TokenAccount>,

    pub metadata: Account<'info, MetadataAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
}
#[derive(Accounts)]
pub struct UnStaking<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        seeds = [TRESURE_SEED],
        bump,
    )]
    pub treasure: Box<Account<'info, Treasure>>,

    pub mint: Account<'info, Mint>,

    #[account(mut)]
    pub associated: Account<'info, TokenAccount>,

    #[account(mut)]
    pub local_associated: Account<'info, TokenAccount>,

    #[account(mut)]
    pub staking: Account<'info, CoinStaking>,

    pub metadata: Account<'info, MetadataAccount>,
    
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub metadata_program: Program<'info, Metadata>,
}