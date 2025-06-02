"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getBuyMeACoffeeContract } from "../utils/contract";
import { supabase } from "../utils/supabaseClient";   

export default function Home() {
  const [account, setAccount] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("10000"); // ETH

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } else {
      alert("Please install MetaMask!");
    }
  };

  const saveMassageToSupabase = async (name: string, message: string, address: string) => {
    const { data, error } = await supabase
      .from("messages")
      .insert([{ name, message, address }]);

    if (error) {
      console.error("Error saving message to Supabase:", error);
    } else {
      console.log("Message saved to Supabase:", data);
    }
  }

  const buyCoffee = async () => {
    try {
      const contract = await getBuyMeACoffeeContract();
      if (!contract) {
        alert("Koneksi ke kontrak gagal. Pastikan MetaMask terinstal dan terhubung ke Sepolia.");
        return;
      }

      // 1. Konversi IDR ke BigInt (tanpa desimal)
      const idrValue = BigInt(amount); // Misalnya 10000 untuk Rp10.000

      // 2. Hitung nilai ETH dari IDR menggunakan oracle
      const ethAmount = await contract.idrtoeth(idrValue);

      // 3. Kirim transaksi buycoffeeinidr
      const txn = await contract.buycoffeeinidr(
        name || "Anonymous",
        message || "Nice work!",
        idrValue,
        { value: ethAmount }
      );
      await txn.wait();

      await saveMassageToSupabase(name, message, account);
      alert("Coffee bought successfully!");
      setMessage("");
      setName("");
    } catch (err: any) {
      console.error(err);
      let errorMessage = "Transaction failed.";
      if (err.reason) {
        errorMessage += ` Reason: ${err.reason}`;
      } else if (err.data && err.data.message) {
        errorMessage += ` Message: ${err.data.message}`;
      } else if (err.message) {
        errorMessage += ` Message: ${err.message}`;
      }
      alert(errorMessage);
    }
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-3xl font-bold mb-4">Buy Me a Coffee ☕</h1>
      {account ? (
        <p className="mb-4">Connected wallet: {account}</p>
      ) : (
        <button onClick={connectWallet} className="bg-black text-white px-4 py-2 rounded mb-4">
          Connect Wallet
        </button>
      )}

      <div className="flex flex-col gap-4 w-full max-w-md">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border rounded"
        />
        <textarea
          placeholder="Say something nice..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Amount in IDR"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border rounded"
        />
        <button onClick={buyCoffee} className="bg-yellow-500 text-white px-4 py-2 rounded">
          Send Coffee ☕
        </button>
      </div>
    </div>
  );
}