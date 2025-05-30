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
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = getBuyMeACoffeeContract(signer);

      const txn = await contract.buyCoffee(
        name || "Anonymous",
        message || "Nice work!",
        { value: ethers.parseEther(amount) }
      );
      await txn.wait();
      alert("Coffee bought successfully!");
      setMessage("");
      setName("");
    } catch (err) {
      console.error(err);
      alert("Transaction failed.");
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
