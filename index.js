#!/usr/bin/env node
"use strict";
const green = require("chalk").green;
const inquirer = require("inquirer");
const utils = require("./utils");
const mixer = require('./mixer')

let depositAmount

function prompt() {
  const depositAddress = utils.generateDepositAddress()
  const houseAddress = 'TheHouse'

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
    mixer.pollNetwork(depositAddress)
      .then(deposit => {
        depositAmount = deposit
        mixer.transferToHouse(deposit, depositAddress, houseAddress)
      })
      .then(response => mixer.distributeCoins(answers.addresses, houseAddress, depositAmount))
      .catch(err => console.error('something went wrong: ', err))

    if (answers.deposit && answers.deposit.toLowerCase() === "y") {
      prompt();
    }
  });
}

console.log("Welcome to the Jobcoin mixer!");
prompt();

module.exports = prompt;
