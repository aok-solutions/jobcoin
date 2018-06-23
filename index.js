#!/usr/bin/env node
"use strict";
const green = require("chalk").green;
const inquirer = require("inquirer");
const utils = require("./utils");
const client = require('./apiClient')

const getDeposit = (address) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      client.getAddressInfo(address)
        .then(response => {
          console.log('response: ', response.data)
          resolve(response.data.balance)
        }).catch(error => reject(new Error(error)))
    }, 2000)
  })
}

const pollNetwork = (address) => {
  return getDeposit(address)
    .then((deposit) => {
      if (parseFloat(deposit) > 0) return deposit
      else return pollNetwork(address)
    }).catch(error => console.error('error retrieving deposit: ', error))
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
    // poll network for transaction to deposit address
    pollNetwork(depositAddress)
      .then(deposit => {
        console.log('coins deposited: ', deposit)
        console.log('distribute to these addresses: ', addresses)
      })

    if (answers.deposit && answers.deposit.toLowerCase() === "y") {
      prompt();
    }
  });
}

console.log("Welcome to the Jobcoin mixer!");
prompt();

module.exports = prompt;
