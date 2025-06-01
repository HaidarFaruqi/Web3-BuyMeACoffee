// frontend/src/utils/contract.ts
import { ethers } from "ethers";
import BuyMeACoffee from "./BuyMeACoffee.json";

const contractAddress = "0x9b9C3E55fDB348f7d9D5921fb3Ff71a4689AB9D9"; // ALAMAT KONTRAK SEPOLIA ANDA
const contractABI = BuyMeACoffee.abi;

export const getBuyMeACoffeeContract = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
        console.error("MetaMask atau provider Web3 tidak ditemukan.");
        return null;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);

    const signer = await provider.getSigner();
    return new ethers.Contract(contractAddress, contractABI, signer);
};