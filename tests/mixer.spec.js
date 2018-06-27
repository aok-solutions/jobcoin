const chai = require("chai")
const spies = require('chai-spies')
const expect = require("chai").expect
chai.use(spies)

const moxios = require('moxios')
const mixer = require("../mixer")

describe('mixer', () => {

  describe('transferToHouse', () => {
    it('should transfer the deposit from the deposit address to the house address', (done) => {
      moxios.withMock(() => {
        let onFulfilled = chai.spy()
        let onFailure = chai.spy()
        let depositAmount = 20
        let depositAddress = 'generatedAddress'
        let houseAddress = 'TheHouse'

        mixer
          .transferToHouse(depositAmount, depositAddress, houseAddress)
          .then(onFulfilled)

        moxios.wait(() => {
          let request = moxios.requests.mostRecent()

          expect(request.config.method).to.equal('post')
          expect(JSON.parse(request.config.data)).to.deep.equal({
            amount: depositAmount,
            fromAddress: depositAddress,
            toAddress: houseAddress
          })

          request.respondWith({
            status: 200
          }).then(() => {
            expect(onFulfilled).to.have.been.called()
            done()
          })
        })
      })
    })
  })
})
