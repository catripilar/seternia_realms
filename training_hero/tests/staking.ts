import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createInitializeMintInstruction, MINT_SIZE } from '@solana/spl-token';
import { PublicKey,sendAndConfirmTransaction,SystemProgram ,Connection,ComputeBudgetProgram} from "@solana/web3.js";
import { CoinStaking } from "./require"
import { Training } from "../target/types/training";
import { readContracts,readPrivateKeys } from "./start"
import {BN} from "bn.js";

const info = {
  programId: new PublicKey("11111111111111111111111111111111"),
  TOKEN_METADATA_PROGRAM_ID: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"),
  mint_address: new PublicKey("")
}

describe("training", () => {
  const con = new Connection("https://api.devnet.solana.com");
  const provider = anchor.AnchorProvider.env();
  const wallet = 
  //readPrivateKeys("private_keys.txt")[0];
  anchor.Wallet.local().payer;
  info.programId = new PublicKey(readContracts("contract.txt")[0]);
  anchor.setProvider(provider);
  //const program = new Program(require("../target/idl/training.json"), info.programId,provider);
  const program = anchor.workspace.training as Program<Training>
  const exe_sys_prog = anchor.web3.SystemProgram;
  //const con = new Connection("http://127.0.0.1:8899");
  it("should staking successfully!", async () => {
    let transaction = new anchor.web3.Transaction();

    const [TreasuryKey,bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [StakingKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("STAKING_SEED"),info.mint_address.toBuffer()],
      program.programId
    );
    const MintTokenAccount = await getAssociatedTokenAddress(
      info.mint_address,
      wallet.publicKey
    );
    const TreasureTokenAccount = await getAssociatedTokenAddress(
      info.mint_address,
      TreasuryKey,
      true
    );
    const [metadataAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("metadata"),info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),info.mint_address.toBuffer()],
      info.TOKEN_METADATA_PROGRAM_ID
    );
    if(await con.getAccountInfo(TreasuryKey)!=null){
      const tx = await program.methods.staking(bump).accounts({
        payer:wallet.publicKey,
        treasure:TreasuryKey,
        staking:StakingKey,
        localAssociated:TreasureTokenAccount,
        mint:info.mint_address,
        associated:MintTokenAccount,
        metadata:metadataAddress,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: exe_sys_prog.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: info.TOKEN_METADATA_PROGRAM_ID,
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const staking_data = await program.account.coinStaking.fetch(TreasuryKey) as CoinStaking;
      console.log("staking data:", staking_data);
    }
  });

  it("should unstaking successfully!", async () => {
    let transaction = new anchor.web3.Transaction();

    const [TreasuryKey,bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [StakingKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("STAKING_SEED"),info.mint_address.toBuffer()],
      program.programId
    );
    const MintTokenAccount = await getAssociatedTokenAddress(
      info.mint_address,
      wallet.publicKey
    );
    const TreasureTokenAccount = await getAssociatedTokenAddress(
      info.mint_address,
      TreasuryKey,
      true
    );
    const [metadataAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("metadata"),info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),info.mint_address.toBuffer()],
      info.TOKEN_METADATA_PROGRAM_ID
    );
    if(await con.getAccountInfo(TreasuryKey)!=null){
      const tx = await program.methods.unstaking(bump).accounts({
        payer:wallet.publicKey,
        treasure:TreasuryKey,
        mint:info.mint_address,
        staking:StakingKey,
        localAssociated:TreasureTokenAccount,
        associated:MintTokenAccount,
        metadata:metadataAddress,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: exe_sys_prog.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: info.TOKEN_METADATA_PROGRAM_ID,
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const staking_data = await program.account.coinStaking.fetch(TreasuryKey) as CoinStaking;
      console.log("staking data:", staking_data);
    }
  });
});
