const main = async () => {
    const [owner, randomPerson] = await hre.ethers.getSigners();
    const waveContractFactory = await hre.ethers.getContractFactory('WavePortal');
    const waveContract = await waveContractFactory.deploy({
      value: hre.ethers.utils.parseEther('0.1'),
    });
    await waveContract.deployed();
  
    console.log('Contract deployed to:', waveContract.address);
    console.log('Contract deployed by:', owner.address);
    console.log('Contract randomPerson:', randomPerson.address);
  
    let contractBalance = await hre.ethers.provider.getBalance(
      waveContract.address
    );
    console.log(
      'Contract balance:',
      hre.ethers.utils.formatEther(contractBalance)
    );

    let waveCount;
    waveCount = await waveContract.getTotalWaves();
    console.log(waveCount.toNumber());
  
    let waveTxn = await waveContract.wave('A message #1');
    await waveTxn.wait();

    let waveTxn2 = await waveContract.connect(randomPerson).wave('Second msg!');
    await waveTxn2.wait();
  
    waveCount = await waveContract.getTotalWaves();

    contractBalance = await hre.ethers.provider.getBalance(waveContract.address);
    console.log(
      'Contract balance:',
      hre.ethers.utils.formatEther(contractBalance)
    );


    let allWaves = await waveContract.getAllWaves();
    console.log(allWaves);
  };
  
  const runMain = async () => {
    try {
      await main();
      process.exit(0);
    } catch (error) {
      console.log(error);
      process.exit(1);
    }
  };
  
  runMain();