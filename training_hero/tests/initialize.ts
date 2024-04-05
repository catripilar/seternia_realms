import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey,sendAndConfirmTransaction ,Connection, Keypair} from "@solana/web3.js";
import { Treasure,Role } from "./require"
import { Training } from "../target/types/training";
import { readContracts,readPrivateKeys } from "./start"
import {BN} from "bn.js";

const marketInfo = {
  programId: new PublicKey("11111111111111111111111111111111"),
  serumDexProgram: new PublicKey("EoTcMgcDRTJVZDMZWBoU6rhYHZfkNTVEAfz3uUJRcYGj"),
  ammProgram: new PublicKey("HWy1jotHpo6UqeQxx49dpYYdQB8wj9Qk9MdxwjLvDHB8"),
  serumMarket: new PublicKey("J1oKpxWJFHwSEHyfVfQ5eGKz2RnUUpZjYAbGBVhU8xgM"),
  role_address: new PublicKey("65ZmLNGUuGw9BMNeXvNZUS6mtDMgfbW1gX2RigobVqJw")
}

describe("training", () => {
  const con = new Connection("https://api.devnet.solana.com");
  const provider = anchor.AnchorProvider.env();
  const wallet = 
  //readPrivateKeys("private_keys.txt")[0];
  anchor.Wallet.local().payer;
  marketInfo.programId = new PublicKey(readContracts("contract.txt")[0]);
  anchor.setProvider(provider);
  //const program = new Program(require("../target/idl/training.json"), marketInfo.programId,provider);
  const program = anchor.workspace.training as Program<Training>
  const exe_sys_prog = anchor.web3.SystemProgram;
  //const con = new Connection("http://127.0.0.1:8899");
  const NFT_COLLECTION = new anchor.web3.PublicKey(
    "ExFWcTTrFMkWc6XCyfPvSpdw8yVLb385ep8ctRvfVt62"
  );
  it("Is initialized!", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [RoleKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("ROLE_SEED")],
      program.programId
    );
    if(await con.getAccountInfo(TreasuryKey)==null){
      const tx = await program.methods.initialize(
        NFT_COLLECTION,
        wallet.publicKey
      ).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        role:RoleKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const treasury_data = await program.account.treasure.fetch(TreasuryKey) as Treasure;
      console.log("treasury data:", treasury_data);
    }
  });

  

  it("should change admin successfully", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const treasury_data = await program.account.treasure.fetch(TreasuryKey) as Treasure;
    if(await con.getAccountInfo(TreasuryKey)!=null 
    && treasury_data.admin.toString() == wallet.publicKey.toString()){
      const tx = await program.methods.changeAdmin(wallet.publicKey).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      console.log("treasury data:", treasury_data);
    }
  });

  

  it("should change collection and metadata successfully", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const treasury_data = await program.account.treasure.fetch(TreasuryKey) as Treasure;
    if(await con.getAccountInfo(TreasuryKey)!=null 
    && treasury_data.admin.toString() == wallet.publicKey.toString()){
      console.log("Ok")
      const newMainCollection = treasury_data.collection;

      const tx = await program.methods.changeCollection(newMainCollection).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      console.log("treasury data:", treasury_data);
    }
  });

  it("should change interval successfully", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const treasury_data = await program.account.treasure.fetch(TreasuryKey) as Treasure;
    if(await con.getAccountInfo(TreasuryKey)!=null 
    && treasury_data.admin.toString() == wallet.publicKey.toString()){

      const tx = await program.methods.changeInterval(new BN(10)).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      console.log("treasury data:", treasury_data.interval.toNumber());
    }
  });
});
