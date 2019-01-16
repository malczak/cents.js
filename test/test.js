// -----------------------
// Lib
// -----------------------
var Money = require("../dist/index");

// -----------------------
// Mocha
// -----------------------
var assert = require("assert");

describe("Simple", function() {
  describe("#equality", function() {
    it("should return true when Money.cents(1).cents == 1", function() {
      assert.equal(Money.cents(1).cents, 1);
    });
  });
});
