#!/usr/bin/env node
"use strict";
const green = require("chalk").green;
const inquirer = require("inquirer");
const utils = require("./utils");
const client = require('./apiClient')

const houseAddress = 'TheHouse'
let depositAmount

const getDeposit = (address) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      client.getAddressInfo(address)
        .then(response => resolve(response.data.balance))
        .catch(error => reject(new Error(error)))
    }, 2000)
  })
}

const pollNetwork = (address) => {
  console.log('polling network...')
  return getDeposit(address)
    .then((deposit) => {
      if (parseFloat(deposit) > 0) return deposit
      else return pollNetwork(address)
    }).catch(error => console.error('error retrieving deposit: ', error))
}

const transferToHouse = (deposit, depositAddress) => {
  depositAmount = deposit
  return client.sendJobcoins(depositAddress, houseAddress, deposit)
}

const distributeCoins = (inputAddresses) => {
  let addresses = inputAddresses.split(",").map(address => address.trim())
  let randoms = addresses.map(address => Math.floor((Math.random() * 100) + 1))
  let sum = randoms.reduce((a,b) => a + b)

  addresses.map((address,i) => {
    let transferAmount = randoms[i] / parseFloat(sum) * parseFloat(depositAmount)
    client.sendJobcoins(houseAddress, address, transferAmount.toString())
      .then(response => console.log(`successfully sent ${transferAmount} to ${address}`))
      .catch(err => console.log('error sending jobcoins: ', err))
  })
}

function prompt() {
  const depositAddress = utils.generateDepositAddress()

  /* Inquirer documentation: https://github.com/SBoudrias/Inquirer.js#documentation */
  inquirer.prompt([
    {
      name: "addresses",
      message: "Please enter a comma-separated list of new, unused Jobcoin addresses where your mixed Jobcoins will be sent:"
    },
    {
      name: "deposit",
      message: `You may now send Jobcoins to address ${green(depositAddress)}. They will be mixed and sent to your destination addresses. \n Enter ${green('"y"')} to run again.`,
      when: (answers) => answers.addresses
    },
  ])
  .then((answers) => {
    pollNetwork(depositAddress)
      .then(deposit => transferToHouse(deposit, depositAddress))
      .then(response => distributeCoins(answers.addresses))
      .catch(err => console.error('something went wrong: ', err))

    if (answers.deposit && answers.deposit.toLowerCase() === "y") {
      prompt();
    }
  });
}

console.log("Welcome to the Jobcoin mixer!");
prompt();

module.exports = prompt;
