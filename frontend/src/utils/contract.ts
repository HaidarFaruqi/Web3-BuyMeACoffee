// frontend/src/utils/contract.ts
import { ethers } from "ethers";
import BuyMeACoffee from "./BuyMeACoffee.json";

const contractAddress = "0x5d7857f5a436b5c2DB6982CB39179066c548D33e"; // ALAMAT KONTRAK SEPOLIA ANDA
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
