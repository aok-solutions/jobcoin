const client = require('./apiClient')

module.exports = {
  getDeposit: (address) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        client.getAddressInfo(address)
          .then(response => resolve(response.data.balance))
          .catch(error => reject(new Error(error)))
      }, 2000)
    })
  },

  pollNetwork: (address) => {
    console.log('polling network...')
    return module.exports.getDeposit(address)
      .then((deposit) => {
        if (parseFloat(deposit) > 0) return deposit
        else return module.exports.pollNetwork(address)
      }).catch(error => console.error('error retrieving deposit: ', error))
  },

  transferToHouse: (deposit, depositAddress, houseAddress) => {
    return client.sendJobcoins(depositAddress, houseAddress, deposit)
  },

  distributeCoins: (inputAddresses, houseAddress, depositAmt) => {
    let addresses = inputAddresses.split(",").map(address => address.trim())
    let randoms = addresses.map(address => Math.floor((Math.random() * 100) + 1))
    let sum = randoms.reduce((a,b) => a + b)

    addresses.map((address,i) => {
      let transferAmount = randoms[i] / parseFloat(sum) * parseFloat(depositAmt)
      client.sendJobcoins(houseAddress, address, transferAmount.toString())
        .then(response => console.log(`successfully sent ${transferAmount} to ${address}`))
        .catch(err => console.log('error sending jobcoins: ', err))
    })
  }
}
