const expect = require("chai").expect;

/**
 * It returns the closest value to the given number from the given array.
 * Throws exception if given array is empty or values are not numbers.
 * Time Complexity: O(N)
 * Space Complexity: O(1)
 * 
 * @param arr Array of numbers
 * @param val number to match
 */

const findItemClosestTo = (arr, val) => {
    /** Throw exception is given array is empty */
    if (arr.length === 0) 
        throw new Error("Given array is empty");

    /** Throw exception is given value to match is not a number */
    if(val === undefined || val === null || typeof val !== "number")
        throw new Error("Invalid value type provided. Only numbers are allowed.");

    /** Throw exception is given array contains a value which is not a number */
    for(let i = 0; i < arr.length; i++) {
        if(arr[i] === undefined || arr[i] === null || typeof arr[i] !== "number")
            throw new Error("Invalid value type provided. Only numbers are allowed.");
    }   

    let diff = Math.abs(val - arr[0]);
    let item = 0;

    for (let i = 1; i < arr.length; i++) {
        if (diff > Math.abs(val - arr[i])) {
            item = i;
            diff = Math.abs(val - arr[i]);

            /** Optimization: we found the val inside the given array */
            if(diff == 0) 
                return arr[item];
        }
    }

    return arr[item];
}

/** Test cases */
describe("Testing findItemClosestTo()", function() {
    
    const arr = [5, 86, 0, 0, -1, -77646, -1, 44545, 0, -7847, 9823787, 78746];

    /**
     * Testing sanity of the method
     */
    it("Returns the value if it exists in the given array", function() {
        const valuesToMatch = [5, -1, 0, -7847, 78746];

        valuesToMatch.forEach(
            a => expect(findItemClosestTo(arr, a)).to.be.equal(a)
        );
    });

     /**
     * Testing given functionality of the method
     */
    it("Returns the value closest to the given value from the given array", function() {
        const valuesToMatch = [
            [-2, -1],
            [1000, 86],
            [-1000, -1],
            [987867, 78746],
            [2, 0]
        ];

        valuesToMatch.forEach(
            a => expect(findItemClosestTo(arr, a[0])).to.be.equal(a[1])
        );
    });

    /**
     * Testing corner cases
     */
    it("Should throw an exception if empty array is provided", function() {
        const valuesToMatch = [5, -1, 0, -7847, 78746];

        valuesToMatch.forEach(
            a => expect(() => findItemClosestTo([], a)).to.throw("Given array is empty")
        );
    });

    it("Should handle one element array", function() {
        const valuesToMatch = [5, -1, 0, -7847, 78746];

        valuesToMatch.forEach(
            a => expect(findItemClosestTo([5], a)).to.be.equal(5)
        );
    });

    it("Should throw exception if non-number type is provided in value to match", function() {
        const valuesToMatch = ['A', "chff", new Object(), [], null];

        valuesToMatch.forEach(
            a => expect(() => findItemClosestTo(arr, a)).to.throw("Invalid value type provided. Only numbers are allowed.")
        );
    });

    it("Should throw exception if non-number type is provided in array", function() {
        const valuesArray = ['A', "chff", new Object(), [], null];
        const valuesToMatch = [5, -1, 0, -7847, 78746];

        valuesToMatch.forEach(
            a => expect(() => findItemClosestTo(valuesArray, a)).to.throw("Invalid value type provided. Only numbers are allowed.")
        );
    });

});