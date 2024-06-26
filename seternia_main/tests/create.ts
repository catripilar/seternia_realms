import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TOKEN_PROGRAM_ID,ASSOCIATED_TOKEN_PROGRAM_ID, createAssociatedTokenAccountInstruction, getAssociatedTokenAddress, createInitializeMintInstruction, MINT_SIZE } from '@solana/spl-token';
import { PublicKey,sendAndConfirmTransaction,SystemProgram ,Connection,ComputeBudgetProgram} from "@solana/web3.js";
import { Faction, Class, Traits } from "./require"
import { Seternia } from "../target/types/seternia";
import { readContracts,readPrivateKeys } from "./start"
import { BN } from "bn.js";
const info = {
  programId: new PublicKey("11111111111111111111111111111111"),
  TOKEN_METADATA_PROGRAM_ID: new PublicKey("metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s")
}

describe("seternia", () => {
  const con = new Connection("https://api.devnet.solana.com");
  const provider = anchor.AnchorProvider.env();
  const wallet = 
  //readPrivateKeys("private_keys.txt")[0];
  anchor.Wallet.local().payer;
  info.programId = new PublicKey(readContracts("contract.txt")[0]);
  anchor.setProvider(provider);
  const program = new Program(require("../target/idl/seternia.json"), info.programId,provider);
  //const program = anchor.workspace.seternia as Program<Seternia>
  const exe_sys_prog = anchor.web3.SystemProgram;
  //const con = new Connection("http://127.0.0.1:8899");
  const fid = new BN(1);
  const cid = new BN(1);
  const tid = new BN(1);
  it("should create faction successfully!", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [FactionKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("FACTION_SEED"),Buffer.from(fid.toArray("le", 8))],
      program.programId
    );
    if(await con.getAccountInfo(TreasuryKey)!=null){
      const tx = await program.methods.createFaction(
        fid,
        ""
      ).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        faction:FactionKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const faction_data = await program.account.faction.fetch(FactionKey) as Faction;
      console.log("faction data:", faction_data);
    }
  });

  it("should create class successfully!", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [FactionKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("FACTION_SEED"),Buffer.from(fid.toArray("le", 8))],
      program.programId
    );
    const [ClassKey] = await anchor.web3.PublicKey.findProgramAddress(
      [FactionKey.toBuffer(),Buffer.from(cid.toArray("le", 8))],
      program.programId
    );
    if(await con.getAccountInfo(TreasuryKey)!=null){
      const tx = await program.methods.createClass(
        cid,
        "",
        "STR"
      ).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        faction:FactionKey,
        class:ClassKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const class_data = await program.account.class.fetch(ClassKey) as Class;
      console.log("class data:", class_data);
    }
  });

  it("should create trait successfully!", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [FactionKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("FACTION_SEED"),Buffer.from(fid.toArray("le", 8))],
      program.programId
    );
    const [ClassKey] = await anchor.web3.PublicKey.findProgramAddress(
      [FactionKey.toBuffer(),Buffer.from(cid.toArray("le", 8))],
      program.programId
    );
    const [TraitKey] = await anchor.web3.PublicKey.findProgramAddress(
      [ClassKey.toBuffer(),Buffer.from(tid.toArray("le", 8))],
      program.programId
    );
    if(await con.getAccountInfo(TreasuryKey)!=null){
      const tx = await program.methods.createTrait(
        tid,
        new BN(0),
        new BN(100),
        ""
      ).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        class:ClassKey,
        traits:TraitKey,
        systemProgram:exe_sys_prog.programId
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
      const trait_data = await program.account.traits.fetch(TraitKey) as Traits;
      console.log("trait data:", trait_data);
    }
  });

  it("should mint collection successfully!", async () => {
    let transaction = new anchor.web3.Transaction();
    const [TreasuryKey,bump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("TRESURE_SEED")],
      program.programId
    );
    const [CollectionKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("collection")],
      program.programId
    );
    const CollectionTokenAccount = await getAssociatedTokenAddress(
      CollectionKey,
      wallet.publicKey
    );
    if(await con.getAccountInfo(CollectionTokenAccount)==null){
      const CollectionAssociatedToken = createAssociatedTokenAccountInstruction(
        wallet.publicKey,
        CollectionTokenAccount,
        wallet.publicKey,
        CollectionKey,
        TOKEN_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
      transaction = transaction.add(CollectionAssociatedToken)
    }
    const [metadataAddress] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("metadata"),info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),CollectionKey.toBuffer()],
      info.TOKEN_METADATA_PROGRAM_ID
    );
    const [masterEdition] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        CollectionKey.toBuffer(),
        Buffer.from("edition")
      ],
      info.TOKEN_METADATA_PROGRAM_ID
    );
    const [delegate] = await anchor.web3.PublicKey.findProgramAddress(
      [
        Buffer.from("metadata"),
        info.TOKEN_METADATA_PROGRAM_ID.toBuffer(),
        CollectionKey.toBuffer(),
        Buffer.from("collection_authority"),
        TreasuryKey.toBuffer()
      ],
      info.TOKEN_METADATA_PROGRAM_ID
    );

    if(await con.getAccountInfo(TreasuryKey)!=null){
      const tx = await program.methods.mintCollection(
        "",
        "",
        "",
        bump
      ).accounts({
        admin:wallet.publicKey,
        treasure:TreasuryKey,
        mint:CollectionKey,
        tokenAccount:CollectionTokenAccount,
        masterEditionAccount:masterEdition,
        nftMetadata:metadataAddress,
        delegate:delegate,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram: exe_sys_prog.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        metadataProgram: info.TOKEN_METADATA_PROGRAM_ID,
      }).instruction();
      transaction.add(tx);
      const txSignature = await sendAndConfirmTransaction(con,transaction,[wallet], { skipPreflight: true });
      
      console.log("Your transaction signature: ", txSignature);
    }
  });
});
