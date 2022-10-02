<template>
  <div class="container">
    <div class="logo"><i class="fa-brands fa-ethereum"></i></div>
    <p class="error" v-if="error !== '' ">{{ error }}</p>
    <p class="success" v-if="success !== '' ">{{ success }}</p>
    <h2>{{ balance / (10 ** 18)}} <span class="eth">eth</span></h2>
    <h4>Contract: {{ contractAddress }} </h4>
    <div class="wallet">
      <div class="walletLeft">
        <h3>Send Ether</h3>
        <input type="text" name="amountSend" v-model="amountSend" placeholder="Amount to send in ETH" />
        <input type="text" name="addressReceiver" v-model="addressReceiver" placeholder="If sending to another wallet (not to this contrat)" />
        <button @click="transfer()">Send</button>
      </div>
      <div class="walletRight">
        <h3>Withdraw Ether</h3>
        <input type="text" name="amountWithdraw" v-model="amountWithdraw" placeholder="Amount to withdraw in ETH" />
        <button @click="withdraw()">Withdraw</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ethers } from 'ethers';
import Wallet from '@/artifacts/contracts/Wallet.sol/Wallet.json';
export default {
  name: 'App',
  data() {
    return {
      contractAddress: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
      addressReceiver: '',
      balance: 0,
      amountSend: 0,
      amountWithdraw: 0,
      error: '',
      success: ''
    }
  },
  mounted(){
    this.getBalance();
  },
  methods : {
    getBalance: async function(){
      if(typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({method : 'eth_requestAccounts'});
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const contract = new ethers.Contract(this.contractAddress, Wallet.abi, provider); //new instance of the contract to interact with the function of the contract
        try {
          let overrides = {
            from: accounts[0]
          }
          const data = await contract.getBalance(overrides);
          this.balance = String(data);
        }
        catch(err) {
          this.setError('An error occured to get the balance');
        }
      }
    },
    transfer: async function(){
      if(!this.amountSend){
        return;
      }
      this.setError('');
      this.setSuccess('');
      if(typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({method : 'eth_requestAccounts'});
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(); 
        try{
          const tx = {
              from: accounts[0],
              value: ethers.utils.parseEther(this.amountSend) //must be a string
          }
          if(this.addressReceiver !== ''){
            tx.to = this.addressReceiver;
          }else{
            tx.to = this.contractAddress;
          }
          const transaction = await signer.sendTransaction(tx);
          await transaction.wait();
          this.amountSend = 0;
          this.addressReceiver = '';
          this.getBalance();
          if(this.addressReceiver !== ''){
            this.setSuccess('Your money was transfered successfully to:' + this.addressReceiver );
          }else{
            this.setSuccess('Your money was transfered successfully to:' + this.contractAddress );
          }
        }
        catch(err){
          console.log(err);
          this.setError('Transfer error has occurred');
        }
      }
    },
    withdraw: async function(){
      if(!this.amountWithdraw){
        return;
      }
      this.setError('');
      this.setSuccess('');
      if(typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({method : 'eth_requestAccounts'});
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner(); 
        const contract = new ethers.Contract(this.contractAddress, Wallet.abi, signer);
        try {
          const transaction = await contract.withdrawMoney(accounts[0], ethers.utils.parseEther(this.amountWithdraw));
          await transaction.wait();
          this.amountWithdraw = 0;
          this.getBalance();
          this.setSuccess('Successful withdrawal');
        }
        catch(err){
          this.setError('Withdrawal error has occurred');
        }
      }
    },
    setError: async function(message){
      this.error = message;
    },
    setSuccess: async function(message){
      this.success = message;
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

* {
  margin:0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
}

body {
  background-color: #393E45;
    color: #D1D5DE;
}

.container {
  width: 100%;
  max-width: 960px;
  margin: 0 auto;
  padding-left: 1rem;
  padding-right: 1rem; 
}

.logo {
  width: 5rem;
  height: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #D1D5DE;
  color: #393E45;
  font-size: 3rem;
  border-radius: 50%;
  text-align: center; 
  margin: 0 auto;
}

h2 {
  margin-top: 2rem;
  font-weight: 400;
  font-size: 2rem;
}

h2 .eth {
  font-weight: 300;
  text-transform: uppercase;
  font-size: 2rem;
}

h3 {
  margin-bottom: 1rem;
}

h4 {
  margin-top: 1rem;
}

.wallet {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
}

.walletLeft, .walletRight {
  width: 50%;
}

.walletLeft {
  display: flex;
  flex-direction: column;
}

.walletLeft > input:nth-child(2) {
  border-bottom-left-radius:0;
  border-top-right-radius: 5px;
}

.walletLeft > input:nth-child(3) {
  border-bottom-left-radius:0;
  border-top-left-radius: 0;
}

.walletLeft > button {
  border-top-right-radius: 0;
  border-bottom-right-radius: 5px;
  border-bottom-left-radius: 5px;
}

input {
  border: 0;
  height: 2rem;
  border-top-left-radius: 5px;
  border-bottom-left-radius: 5px;
  padding-left: 1rem;
  padding-right: 1rem;
  margin-bottom: 0.5rem;
}

button {
  border-top-right-radius: 5px;
  border-bottom-right-radius: 5px;
  height: 2rem;
  border: 0;
  padding-left: 1rem;
  padding-right: 1rem;
  cursor: pointer;
  background-color: #D1D5DE;
  color: #393E45;
}

.error, .success {
  padding: 1rem;
  margin-top: 1rem;
  border-radius: 5px;
}

.error {
  background-color: #EE3312;
  color: #D1D5DE;
}

.success {
  background-color: #53814D;
  color: #D1D5DE;
}

</style>
