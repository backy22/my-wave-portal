import React, { useEffect, useState } from "react";
import {useWindowSize} from 'react-use';
import { ethers } from "ethers";
import './App.css';
import wavePortal from './utils/WavePortal.json';
import Moment from 'react-moment';
import Confetti from 'react-confetti'
import twitterLogo from './assets/twitter-logo.svg';
import trophyIcon from './assets/trophy.svg';

const App = () => {
  const { width, height } = useWindowSize()
  const [currentAccount, setCurrentAccount] = useState('');
  const [message, setMessage] = useState('');
  const [imglink, setImglink] = useState('');
  const [loading, setLoading] = useState(false)
  const [totalWave, setTotalLWave] = useState(0)
  const [allWaves, setAllWaves] = useState([]);
  const [celebrating, setCelebrating] = useState(false);
  const contractAddress = "0xe7C2085E0ba2f045580cB3d12B941f3028e06439";
  const TWITTER_HANDLE = 'la_ayanbe';
  const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

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

        const waveTxn = await wavePortalContract.wave(message || '👋', imglink, { gasLimit: 300000 });
        setLoading(true)
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
      alert('Failed to mint. Please try again later')
    } finally {
      setLoading(false)
      setMessage('')
      setImglink('')
    }
  }

  useEffect(() => {
    const getAllWaves = async () => {
      const { ethereum } = window;
      try {
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, wavePortal.abi, signer);
  
          const setFormatWaves = async() => {
            const waves = await wavePortalContract.getAllWaves();
            let wavesCleaned = [];
            for(let i = waves.length - 1; i >= 0; i--) {
              wavesCleaned.push({
                address: waves[i].waver,
                timestamp: new Date(waves[i].timestamp * 1000),
                message: waves[i].message,
                imglink: waves[i].imglink,
                win: waves[i].win
              });
            }
            setAllWaves(wavesCleaned)
            let count = await wavePortalContract.getTotalWaves();
            setTotalLWave(count.toNumber());
          }
  
          await setFormatWaves();
  
          /**
           * Listen in for emitter events!
           */
          wavePortalContract.on("NewWave", (from, timestamp, message, imglink, win) => {
            setFormatWaves();
          });
  
          wavePortalContract.on("NewWin", (from) => {
            setCelebrating(true)
            setTimeout(() => {
              setCelebrating(false)
            }, 5000)
          })
        } else {
          console.log("Ethereum object doesn't exist!")
        }
      } catch (error) {
        console.log(error);
      }
    }

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

    checkIfWalletIsConnected();
  }, [currentAccount, setAllWaves])
  
  return (
    <div className="mainContainer">
      <section className="dataContainer">
        <div className="header-container">
          <div className="header">
            👋 Hey there!
          </div>

          <div className="bio">
            I am Aya and I am software & blockchain developer! Connect your Ethereum wallet and send me a message and your favorite gif!
          </div>

          <div className="count">
            Wave Count: {totalWave}
          </div>

          <form onSubmit={wave} className="waveForm">
            <input type="text" placeholder="Enter your message" value={message} onChange={(e) => setMessage(e.target.value)} />
            <input type="text" placeholder="Grab a gif from giphy" value={imglink} onChange={(e) => setImglink(e.target.value)} />
            <button className="waveButton" type="submit" onClick={wave}>
              Wave at Aya
            </button>
          </form>

          {!currentAccount && (
            <button className="waveButton" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}

          {loading && <div className="loader"></div>}

          {celebrating && (
            <div className="prize-container">
              <div>
                <img className="prize-img" src={trophyIcon} alt="trophy icon" />
              </div>
              <p>
                You won 0.0001 ETH!
              </p>
            </div>
          )}
        </div>

        {allWaves.map((wave, index) => {
          return (
            <div key={index} className="message-container">
              <div className="address">
                {wave.win && <div><img src={trophyIcon} className="trophy-icon" alt="trophy icon"/></div>}
                <div>{wave.address}</div>
              </div>
              <div className="timestamp">
                <Moment format="LLLL">
                  {wave.timestamp.toString()}
                </Moment>
              </div>
              <div className="message">{wave.message}</div>
              {wave.imglink && (
                <div className="img-container">
                  <img src={wave.imglink} alt="" className="message-img"/>
                </div>
              )}
            </div>)
        })}
      </section>
      <section className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
      </section>
      {celebrating && <Confetti width={width} height={height} />}
    </div>
  );
}

export default App