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
  MAIN_PROGRAM_ID: new PublicKey(""),
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
  it("should distribution successfully!", async () => {
    let transaction = new anchor.web3.Transaction();

    const [TreasuryKey,bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [RoleKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("ROLE_SEED")],
      info.MAIN_PROGRAM_ID
    );
    const [WalletKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("COIN_SEED"),wallet.publicKey.toBuffer()],
      info.MAIN_PROGRAM_ID
    );
    const [StakingKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("STAKING_SEED"),info.mint_address.toBuffer()],
      program.programId
    );
    if(await con.getAccountInfo(TreasuryKey)==null){
      const tx = await program.methods.distribution(
        wallet.publicKey,
        bump
        ).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        role:RoleKey,
        staking:StakingKey,
        wallet:WalletKey,
        mainProgram:info.MAIN_PROGRAM_ID,
        systemProgram: exe_sys_prog.programId,
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const staking_data = await program.account.coinStaking.fetch(TreasuryKey) as CoinStaking;
      console.log("staking data:", staking_data);
    }
  });
});
