// frontend/src/utils/contract.ts
import { ethers } from "ethers";
import BuyMeACoffee from "./BuyMeACoffee.json";

const contractAddress = "0x3a9A1fF88265af8287fa879955565195d2eA8cA1"; //Alamat jaringan sepolia
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
