use anchor_lang::prelude::*;
use crate::{constants::*, states::*,errors::*};

pub fn distribution(ctx: Context<Distribution>,payer: Pubkey,_bump:u8) -> Result<()> {

    let accts: &mut Distribution<'_> = ctx.accounts;
    let program = accts.main_program.clone();
    let binding = _bump.to_le_bytes();

    let seeds: &[&[&[u8]]] = &[&[
        TRESURE_SEED.as_ref(),
        binding.as_ref()
    ]];
    let amount = accts.staking.amount;

    if !accts.role.addresses.contains(&accts.admin.key()) {
        return Err(CustomError::ZeroAddressDetected.into());
    }
    let cpi_deposit  = CpiContext::new_with_signer(
        program.to_account_info(), 
        seternia::cpi::accounts::AddCoin{
            role:accts.role.to_account_info(),
            wallet:accts.wallet.to_account_info(),
            authority:accts.admin.to_account_info(),
            system_program:accts.system_program.to_account_info()
        },
        seeds
    );
    let _ =  seternia::cpi::add_coin(cpi_deposit, payer ,amount)?;

    accts.staking.amount -= amount;

    Ok(())
}
#[derive(Accounts)]
#[instruction(payer: Pubkey)]
pub struct Distribution<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(mut)]
    pub staking: Account<'info, CoinStaking>,

    #[account(
        seeds = [TRESURE_SEED],
        bump,
    )]
    pub treasure: Box<Account<'info, Treasure>>,

    #[account(
        mut,
        seeds = [ROLE_SEED],
        bump,
        seeds::program = main_program.key()
    )]
    /// CHECK: seternia Main Check
    pub role: Box<Account<'info, Role>>,

    #[account(
        mut,
        seeds = [COIN_SEED,payer.key().as_ref()], 
        bump,
        seeds::program = main_program.key()
    )]
    /// CHECK: seternia Main Check
    pub wallet: UncheckedAccount<'info>,

    pub main_program: Program<'info, seternia::program::Seternia>,
    pub system_program: Program<'info, System>,
}