const { expect, assert } = require("chai");

describe("Wallet", function () {

  let contract;

  before(async function(){
    const walletContract = await ethers.getContractFactory("Wallet");
    contract = await walletContract.deploy();
    console.log(contract.address);
  });

  it('should deploy the contract', async function(){
    const walletContract = await ethers.getContractFactory("Wallet");
    const err = null;
    try {
      const walletContractDeployement = await walletContract.deploy();
    }
    catch(error){
      err = error;
    }
    assert.equal(err, null, 'The contract is not deployed');
  });

  it('at first, the contract balance should be 0', async function(){
      let balance = await contract.getBalance();
      expect(balance).to.equal(0);
  });

  it('send 1 ETH and 2ETH to the contract, the contract should return the balance of 3 ETH', async function(){
      const [user] = await ethers.getSigners();
      const transaction1 = await user.sendTransaction({
        to: contract.address,
        value: ethers.utils.parseEther("1.0")
      })
      const transaction2 = await user.sendTransaction({
        to: contract.address,
        value: ethers.utils.parseEther("2.0")
      })
      let balance = await contract.getBalance();
      expect(balance).to.equal(ethers.utils.parseEther("3.0"));
  });

  it('send 1 ETH to another address, the contract should still return the balance of 3 ETH', async function(){
      const [user, user2] = await ethers.getSigners();
      const transaction = await user.sendTransaction({
        to: user2.address,
        value: ethers.utils.parseEther("1.0")
      })
      let balance = await contract.getBalance();
      expect(balance).to.equal(ethers.utils.parseEther("3.0"));
  });

  it('withdraw 1 ETH, the contract should return the balance of 2 ETH', async function(){
      const [user] = await ethers.getSigners();
      const withdraw = await contract.withdrawMoney(user.address, ethers.utils.parseEther("1.0"));
      let balance = await contract.getBalance();
      expect(balance).to.equal(ethers.utils.parseEther("2.0"));
  });

  it('should not be able to withdraw if the balance of the user is not enough', async function(){
    let err = null;
    const [user] = await ethers.getSigners();
    try {
      let result = await contract.withdrawMoney(user.address, ethers.utils.parseEther("4.0"));
    }
    catch(error){
      err = error;
    }
    assert.ok(err instanceof Error);
  });

});