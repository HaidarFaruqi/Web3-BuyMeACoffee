import { ethers } from "ethers";
import BuyMeACoffee from "./BuyMeACoffee.json";

const contractAddress = "0xABC123..."; // Ganti sesuai hasil deploy
const contractABI = BuyMeACoffee.abi;

export const getBuyMeACoffeeContract = () => {
  if (typeof window === "undefined" || !window.ethereum) return null;

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};
