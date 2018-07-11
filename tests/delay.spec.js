const expect = require("chai").expect;

describe("Testing Delays", function() {

    it("can handle long running process", function() {
        for(let i = 0; i <  1000000000; i++);
        expect(5+9).to.equal(14);
    });

});