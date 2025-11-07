// frontend/src/utils/contract.ts
import { ethers } from "ethers";
import BuyMeACoffee from "./BuyMeACoffee.json";

// Get contract address from environment variable
const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";
const contractABI = BuyMeACoffee.abi;

/**
 * Get instance of BuyMeACoffee contract connected to user's wallet
 * @returns Contract instance or null if MetaMask is not available
 */
export const getBuyMeACoffeeContract = async () => {
    // Validate contract address is set
    if (!contractAddress) {
        console.error("Contract address not set. Please add NEXT_PUBLIC_CONTRACT_ADDRESS to your .env.local file.");
        return null;
    }

    // Check if running in browser and MetaMask is available
    if (typeof window === "undefined" || !window.ethereum) {
        console.error("MetaMask or Web3 provider not found. Please install MetaMask.");
        return null;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        return new ethers.Contract(contractAddress, contractABI, signer);
    } catch (error) {
        console.error("Error connecting to contract:", error);
        return null;
    }
};
