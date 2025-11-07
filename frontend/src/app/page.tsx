"use client";

import { useEffect, useState, useRef } from "react";
import { getBuyMeACoffeeContract } from "../utils/contract";
import { supabase } from "../utils/supabaseClient";
import { Contract } from "ethers";

/**
 * Interface for notification memo structure
 */
interface NotificationMemo {
  from: string;
  timestamp: Date;
  name: string;
  message: string;
}

export default function Home() {
  // ============ State Management ============
  const [account, setAccount] = useState("");
  const [message, setMessage] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("10000"); // Default IDR amount
  const [notification, setNotification] = useState<NotificationMemo | null>(null);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Ref to store timeout ID for notification
  const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ============ Wallet Connection ============

  /**
   * Connect user's MetaMask wallet
   */
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this application!");
      return;
    }

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
      });
      setAccount(accounts[0]);
    } catch (error) {
      console.error("Error connecting wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  // ============ Database Operations ============

  /**
   * Save message to Supabase database
   */
  const saveMessageToSupabase = async (
    name: string,
    message: string,
    address: string
  ) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([{ name, message, address }]);

      if (error) {
        console.error("Error saving message to Supabase:", error);
      } else {
        console.log("Message saved to Supabase:", data);
      }
    } catch (err) {
      console.error("Supabase error:", err);
    }
  };

  // ============ Coffee Purchase ============

  /**
   * Purchase coffee by sending donation
   */
  const buyCoffee = async () => {
    if (!account) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!name.trim()) {
      alert("Please enter your name!");
      return;
    }

    if (!amount || parseInt(amount) <= 0) {
      alert("Please enter a valid amount!");
      return;
    }

    setIsLoading(true);

    try {
      const contract = await getBuyMeACoffeeContract();
      if (!contract) {
        alert("Failed to connect to contract. Please ensure MetaMask is connected to Sepolia testnet.");
        setIsLoading(false);
        return;
      }

      // Convert amount to BigInt
      const idrValue = BigInt(amount);

      // Get required ETH amount
      const ethAmount = await contract.idrToEth(idrValue);

      // Send transaction with updated function name
      const txn = await contract.buyCoffeeInIdr(
        name.trim() || "Anonymous",
        message.trim() || "Thanks for the great work!",
        idrValue,
        { value: ethAmount }
      );

      // Wait for transaction confirmation
      await txn.wait();

      // Save to Supabase
      await saveMessageToSupabase(name, message, account);

      // Success feedback
      alert("Coffee purchased successfully! ☕ Thank you!");

      // Clear form
      setMessage("");
      setName("");

    } catch (err: unknown) {
      console.error("Transaction error:", err);

      let errorMessage = "Transaction failed.";

      if (typeof err === 'object' && err !== null) {
        // Handle user rejection
        if ('code' in err && err.code === 4001) {
          errorMessage = "Transaction cancelled by user.";
        }
        // Handle contract revert with reason
        else if ('reason' in err && typeof err.reason === 'string') {
          errorMessage = `Transaction failed: ${err.reason}`;
        }
        // Handle error with message
        else if ('message' in err && typeof err.message === 'string') {
          errorMessage = `Error: ${err.message}`;
        }
        // Handle insufficient funds
        else if ('code' in err && err.code === 'INSUFFICIENT_FUNDS') {
          errorMessage = "Insufficient ETH in wallet. Please add more Sepolia ETH.";
        }
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // ============ Event Listeners ============

  /**
   * Listen for NewMemo events from the contract
   */
  useEffect(() => {
    let contract: Contract | null = null;

    const listenForMemos = async () => {
      contract = await getBuyMeACoffeeContract();
      if (!contract) {
        console.warn("Contract not found, unable to listen for events.");
        return;
      }

      // Event listener callback
      const handleNewMemo = (
        from: string,
        timestamp: bigint,
        name: string,
        message: string
      ) => {
        const newNotification: NotificationMemo = {
          from: from,
          timestamp: new Date(Number(timestamp) * 1000),
          name: name,
          message: message,
        };

        console.log("New memo received:", newNotification);

        // Clear previous notification timeout if exists
        if (notificationTimeoutRef.current) {
          clearTimeout(notificationTimeoutRef.current);
        }

        // Show new notification
        setNotification(newNotification);
        setNotificationVisible(true);

        // Auto-hide after 8 seconds
        notificationTimeoutRef.current = setTimeout(() => {
          setNotificationVisible(false);
          setNotification(null);
          notificationTimeoutRef.current = null;
        }, 8000);
      };

      // Attach event listener
      contract.on("NewMemo", handleNewMemo);
    };

    if (account) {
      listenForMemos();
    }

    // Cleanup function
    return () => {
      if (contract) {
        contract.off("NewMemo");
      }
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [account]);

  // ============ Render ============

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-4">Buy Me a Coffee ☕</h1>

      {account ? (
        <p className="mb-4 text-sm text-gray-400">
          Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}
        </p>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-gray-800 text-white px-4 py-2 rounded mb-4 hover:bg-gray-700 transition"
        >
          Connect Wallet
        </button>
      )}

      <div className="flex flex-col gap-4 w-full max-w-md bg-gray-900 p-6 rounded-lg shadow-lg">
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          disabled={isLoading}
          className="p-2 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
        />
        <textarea
          placeholder="Say something nice..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          disabled={isLoading}
          className="p-2 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
        />
        <input
          type="number"
          placeholder="Amount in IDR"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading}
          className="p-2 border border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
        />
        <button
          onClick={buyCoffee}
          disabled={isLoading || !account}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Processing..." : "Send Coffee ☕"}
        </button>
      </div>

      {/* Notification Toast */}
      {notificationVisible && notification && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-lg shadow-xl animate-fade-in-up transition-all duration-500 z-50 max-w-sm">
          <h3 className="font-bold text-lg mb-1">New Coffee! ☕</h3>
          <p className="text-sm">From: {notification.name}</p>
          <p className="text-sm">Message: &apos;{notification.message}&apos;</p>
          <p className="text-xs mt-1 text-yellow-100">
            {notification.timestamp.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
