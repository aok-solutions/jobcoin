const expect = require("chai").expect
const sinon = require('sinon')
const moxios = require('moxios')
const mixer = require("../mixer")

describe('mixer', () => {
  beforeEach(() => moxios.install())
  afterEach(() => moxios.uninstall())

  describe('pollNetwork', () => {
    it('should poll the network until the deposit amount is greater than zero', async () => {
      let address = 'depositAddress'
      let getDeposit = sinon.stub(mixer, 'getDeposit')
      getDeposit.onCall(0).returns(Promise.resolve(0))
      getDeposit.onCall(1).returns(Promise.resolve(0))
      getDeposit.onCall(2).returns(Promise.resolve(0))
      getDeposit.onCall(3).returns(Promise.resolve(20))

      let result = await mixer.pollNetwork(address)

      expect(result).to.equal(20)
      sinon.assert.callCount(getDeposit, 4)

      getDeposit.restore()
    })
  })

  describe('transferToHouse', () => {
    it('should transfer the deposit from the deposit address to the house address', (done) => {
      moxios.withMock(() => {
        let onFulfilled = sinon.spy()
        let onFailure = sinon.spy()
        let depositAmount = 20
        let depositAddress = 'generatedAddress'
        let houseAddress = 'TheHouse'

        mixer.transferToHouse(depositAmount, depositAddress, houseAddress)
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
            sinon.assert.calledOnce(onFulfilled)
            done()
          })
        })
      })
    })
  })
})
