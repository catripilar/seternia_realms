use anchor_lang::prelude::*;

#[error_code]
pub enum CustomError {

    #[msg("You are not authorized to perform this action.")]
    Unauthorized,

    #[msg("You are not authorized to perform this action.")]
    NotAllowedAuthority,

    #[msg("Incorrect Amount.")]
    IncorrectAmount,

    #[msg("Incorrect Time to Execute.")]
    IncorrectTime,

    #[msg("Incorrect NFT Definition.")]
    IncorrectNFT,

    #[msg("Incorrect Order Definition.")]
    IncorrectDefinition,

    #[msg("ZeroAddressDetected")]
    ZeroAddressDetected,

    #[msg("Incorrect associated account")]
    IncorrectAssociated,

    #[msg("Math Operation Overflow")]
    MathOverflow,

    #[msg("account with empty data")]
    EmptyData,
}