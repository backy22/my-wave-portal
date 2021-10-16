import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import wavePortal from './utils/WavePortal.json';

const App = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false)
  const [totalWave, setTotalLWave] = useState(0)
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "0x916e7d01436F943cF2405D6Bd9e379009c4Efcc3";
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllWaves();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

  const wave = async (event) => {
    event.preventDefault();

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, wavePortal.abi, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave(message || '👋', { gasLimit: 300000 });
        setLoading(true)
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
        setTotalLWave(count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  const getAllWaves = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, wavePortal.abi, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        for(let i = waves.length - 1; i >= 0; i--) {
          wavesCleaned.push({
            address: waves[i].waver,
            timestamp: new Date(waves[i].timestamp * 1000),
            message: waves[i].message
          });
        }

        setAllWaves(wavesCleaned);

        /**
         * Listen in for emitter events!
         */
        wavePortalContract.on("NewWave", (from, timestamp, message) => {
        console.log("NewWave", from, timestamp, message);

        setAllWaves(prevState => [...prevState, {
            address: from,
            timestamp: new Date(timestamp * 1000),
            message: message
          }]);
        });
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
          I am Aya and I am software & blockchain developer! Connect your Ethereum wallet and wave with your message at me!
        </div>

        <div className="count">
          Wave Count: {totalWave}
        </div>

        <form onSubmit={wave} className="waveForm">
          <input type="text" placeholder="Enter your message" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button className="waveButton" type="submit" onClick={wave}>
            Wave at Me
          </button>
        </form>

        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {loading && <div className="loader"></div>}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App