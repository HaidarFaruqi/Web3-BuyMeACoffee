import { ethers } from "ethers";
import BuyMeACoffee from "./BuyMeACoffee.json";

const contractAddress = "0x5301161868d842599fb7D1849E9E9784Ee5B2F0D";
const contractABI = BuyMeACoffee.abi;

export const getBuyMeACoffeeContract = async () => {
  if (typeof window === "undefined" || !window.ethereum) return null;

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(contractAddress, contractABI, signer);
};
