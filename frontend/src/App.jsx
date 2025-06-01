import { ethers } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./contract-config";
import { useState, useEffect } from "react";

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);

  async function connectWallet() {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      setAccount(address);

      const contractInstance = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );
      setContract(contractInstance);
    } else {
      alert("Install MetaMask dulu ya!");
    }
  }

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <div>
      <h1>My DApp</h1>
      <p>Connected Account: {account}</p>
    </div>
  );
}

export default App;
