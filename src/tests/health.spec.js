const chai = require("chai");
const expect = chai.expect;

const {
  healthCheckSync,
  healthCheckAsync
} = require('../controllers/health.controller');

describe("/health api", () => {

  describe("sync function", () => {

    it("should return ok ", () => {

      let res = healthCheckSync();

      expect(res).to.equal('OK');
    })
  })

  describe("sync function", () => {

    it("should return ok ", async  () => {

      let res = await healthCheckAsync();

      expect(res).to.equal('OK');
    })
  })

})