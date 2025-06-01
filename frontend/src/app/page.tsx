"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { getBuyMeACoffeeContract } from "../utils/contract";

export default function Home() {
  const [account, setAccount] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("0.001"); // ETH

  const connectWallet = async () => {
    if (window.ethereum) {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      setAccount(accounts[0]);
    } else {
      alert("Please install MetaMask!");
    }
  };

  const buyCoffee = async () => {
    try {
      // 1. Panggil getBuyMeACoffeeContract TANPA argumen
      // 2. Gunakan 'await' karena ini adalah fungsi async
      const contract = await getBuyMeACoffeeContract();

      // PENTING: Periksa apakah 'contract' berhasil didapatkan atau null
      // getBuyMeACoffeeContract bisa mengembalikan null jika MetaMask tidak ditemukan atau jaringan salah
      if (!contract) {
        alert("Koneksi ke kontrak gagal. Pastikan MetaMask terinstal dan terhubung ke Sepolia.");
        return; // Hentikan eksekusi jika kontrak tidak valid
      }

      const txn = await contract.buyCoffee(
        name || "Anonymous",
        message || "Nice work!",
        { value: ethers.parseEther(amount) }
      );
      await txn.wait();
      alert("Coffee bought successfully!");
      setMessage("");
      setName("");
    } catch (err: any) { // Tambahkan ': any' untuk tiping yang lebih baik
      console.error(err);
      // Coba tampilkan pesan error yang lebih detail
      let errorMessage = "Transaction failed.";
      if (err.reason) { // Pesan dari ethers.js revert reason
          errorMessage += ` Reason: ${err.reason}`;
      } else if (err.data && err.data.message) { // Pesan dari error RPC (misal Metamask)
          errorMessage += ` Message: ${err.data.message}`;
      } else if (err.message) { // Pesan error JavaScript umum
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
          placeholder="Amount in ETH"
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