"use client";

import { useEffect, useState } from "react";
// Hapus import 'ethers' karena tidak digunakan secara langsung di file ini.
// import { ethers } from "ethers"; // BARIS INI DIHAPUS
import { getBuyMeACoffeeContract } from "../utils/contract";
import { supabase } from "../utils/supabaseClient";

export default function Home() {
  const [account, setAccount] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("10000"); // Jumlah IDR

  const [notification, setNotification] = useState(null);
  const [notificationVisible, setNotificationVisible] = useState(false);

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
  };

  const buyCoffee = async () => {
    try {
      const contract = await getBuyMeACoffeeContract();
      if (!contract) {
        alert("Koneksi ke kontrak gagal. Pastikan MetaMask terinstal dan terhubung ke Sepolia.");
        return;
      }

      // BigInt adalah objek global JavaScript, tidak perlu import ethers di sini
      const idrValue = BigInt(amount); 
      const ethAmount = await contract.idrtoeth(idrValue);

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
    } catch (err: unknown) { // Perubahan dari 'any' ke 'unknown'
      console.error(err);
      let errorMessage = "Transaction failed.";
      
      // Penanganan error yang lebih aman untuk tipe 'unknown'
      if (typeof err === 'object' && err !== null) {
          if ('reason' in err && typeof err.reason === 'string') {
              errorMessage += ` Reason: ${err.reason}`;
          } else if ('data' in err && typeof err.data === 'object' && err.data !== null && 'message' in err.data && typeof err.data.message === 'string') {
              errorMessage += ` Message: ${err.data.message}`;
          } else if ('message' in err && typeof err.message === 'string') {
              errorMessage += ` Message: ${err.message}`;
          }
      }
      alert(errorMessage);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps, @typescript-eslint/no-unused-vars
  // Baris di atas adalah komentar untuk mematikan aturan ESLint tertentu
  // jika Anda masih mendapatkan 'useEffect' is defined but never used.
  useEffect(() => { 
    const listenForMemos = async () => {
      const contract = await getBuyMeACoffeeContract();
      if (!contract) {
        console.warn("Kontrak tidak ditemukan, tidak bisa mendengarkan event.");
        return;
      }

      contract.on("NewMemo", (from, timestamp, name, message) => {
        const newNotification = {
          from: from,
          timestamp: new Date(Number(timestamp) * 1000),
          name: name,
          message: message,
        };
        console.log("Memo baru diterima:", newNotification);

        setNotification(newNotification);
        setNotificationVisible(true);

        setTimeout(() => {
          setNotificationVisible(false);
          setNotification(null);
        }, 8000);
      });

      return () => {
        contract.off("NewMemo");
      };
    };

    if (account) {
        listenForMemos();
    }
    
  }, [account]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">Buy Me a Coffee ☕</h1>
      {account ? (
        <p className="mb-4">Connected wallet: {account}</p>
      ) : (
        <button onClick={connectWallet} className="bg-gray-800 text-white px-4 py-2 rounded mb-4 hover:bg-gray-700 transition">
          Connect Wallet
        </button>
      )}

      <div className="flex flex-col gap-4 w-full max-w-md bg-gray-900 p-6 rounded-lg shadow-lg">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="p-2 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <textarea
          placeholder="Say something nice..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="p-2 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <input
          type="text"
          placeholder="Amount in IDR"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="p-2 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
        <button onClick={buyCoffee} className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition font-semibold">
          Send Coffee ☕
        </button>
      </div>

      {notificationVisible && notification && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-lg shadow-xl animate-fade-in-up transition-all duration-500 z-50">
          <h3 className="font-bold text-lg mb-1">New Coffee! ☕</h3>
          <p>From: {notification.name}</p>
          <p>Message: '{notification.message}'</p>
          <p className="text-sm mt-1">{notification.timestamp.toLocaleTimeString()}</p>
        </div>
      )}
    </div>
  );
}