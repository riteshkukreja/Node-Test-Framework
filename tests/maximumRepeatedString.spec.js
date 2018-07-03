const expect = require("chai").expect;

/**
 * It returns the first string among the strings with maximum frequency in the array.
 * Throws exception if given array is empty or values are not strings.
 * 
 * Approach:
 * - It sorts the array
 * - Calculates the frequency of all strings
 * - Returns the first one with maximum frequency in Lexicographic order
 * 
 * Time Complexity: O(N * Log N)
 * Space Complexity: O(1)
 * 
 * @param {Array<string>} arr array of strings to be used
 */
const maximumRepeatedString = (arr) => {
    /** Throw exception is given array is empty */
    if (arr.length === 0) 
        throw new Error("Given array is empty");

    /** Throw exception is given array contains a value which is not a string */
    for(let i = 0; i < arr.length; i++) {
        if(arr[i] === undefined || arr[i] === null || typeof arr[i] !== "string")
            throw new Error("Invalid value type provided. Only strings are allowed.");
    }  

    /** Sort the array */
    arr.sort();

    let maximumFrequency = 1;
    let itemWithMaximumFrequency = arr[0];

    let currentItem = arr[0];
    let currentFrequency = 1;

    for(let i = 1; i < arr.length; i++) {
        if(arr[i] == currentItem) {
            currentFrequency++;
        } else if(currentFrequency > maximumFrequency) {
            itemWithMaximumFrequency = currentItem;
            maximumFrequency = currentFrequency;

            currentFrequency = 1;
            currentItem = arr[i];
        } else {
            currentFrequency = 1;
            currentItem = arr[i];
        }

        /** Optimization: if frequency is greater than half, return the item */
        if(maximumFrequency > arr.length / 2)
            return itemWithMaximumFrequency;
    }

    /** Check last value of current item and frequency */
    if(currentFrequency > maximumFrequency) {
        itemWithMaximumFrequency = currentItem;
        maximumFrequency = currentFrequency;
    }

    return itemWithMaximumFrequency;
};

/**
 * It returns the first string among the strings with maximum frequency in the array.
 * Throws exception if given array is empty or values are not strings.
 * 
 * Approach:
 * - Calculates the frequency of all strings and save it to map with their positions
 * - Returns the first one with maximum frequency from the map based on position
 * 
 * Time Complexity: O(N)
 * Space Complexity: O(N)
 * 
 * @param {Array<string>} arr array of strings to be used
 */
const maximumRepeatedStringWithMemorization = (arr) => {
    /** Throw exception is given array is empty */
    if (arr.length === 0) 
        throw new Error("Given array is empty");

    /** Throw exception is given array contains a value which is not a string */
    for(let i = 0; i < arr.length; i++) {
        if(arr[i] === undefined || arr[i] === null || typeof arr[i] !== "string")
            throw new Error("Invalid value type provided. Only strings are allowed.");
    }  

    const map = new Map();

    for(let i = 0; i < arr.length; i++) {
        const itemInMap = map.get(arr[i]);
        if(itemInMap !== undefined) {
            map.set(arr[i], {
                count: itemInMap.count + 1,
                position: itemInMap.position
            });

        } else {
            map.set(arr[i], {
                count: 1,
                position: i
            });
        }
    }

    let maximumFrequency = 0;
    let itemWithMaximumFrequency = -1;

    map.forEach(
        (value, key) => {
            if(value.count > maximumFrequency) {
                itemWithMaximumFrequency = value.position;
                maximumFrequency = value.count;
            } else if(value.count === maximumFrequency && value.position < itemWithMaximumFrequency) {
                itemWithMaximumFrequency = value.position;
            }
        }
    );

    return arr[itemWithMaximumFrequency];
};

/** Test cases */
describe("Testing maximumRepeatedString()", function() {

    /** Sanity Cases */
    it("should return the item with maximum frequency", function() {

        const valuesToMatch = [
            [["A", "B", "C", "the", "hello", "B", "C"], "B"],
            [["A", "B", "C", "the", "hello", "hello", "hello"], "hello"],
            [["A", "B", "C", "the", "hello", "K", "C"], "C"],
            [["A", "B", "C", "the", "hello", "C", "B"], "B"],
            [["hello", "B", "C", "the", "hello", "B", "C"], "B"],
            [["hello", "B", "C", "the", "ZZZ", "ZZZ", "ZZZ"], "ZZZ"],
            [["and", "I", "and", "am", "and", "I", "and"], "and"]
        ];

        valuesToMatch.forEach(
            a => expect(maximumRepeatedString(a[0])).to.be.equal(a[1])
        );

    });

    /** Invalid value Exception Cases */
    it("should throw exceptions if invalid value array is provided", function() {

        const valuesToMatch = [
            ["A", "B", "C", "the", "hello", new Object(), "hello"],
            ["A", "B", "C", "the", "hello", [], "C"],
            ["A", "B", "C", "the", 866, "C", "B"],
            ["hello", "B", "C", "the", "hello", null, "C"],
            ["hello", "B", undefined, "the", "ZZZ", "ZZZ", "ZZZ"]
        ];

        valuesToMatch.forEach(
            a => expect(() => maximumRepeatedString(a)).to.throw("Invalid value type provided. Only strings are allowed.")
        );

    });

    /** Empty array Exception Cases */
    it("should throw exceptions if given array is empty", function() {
        expect(() => maximumRepeatedString([])).to.throw("Given array is empty");
    });

    /** Corner Cases */
    it("should return the first item with maximum frequency", function() {

        const valuesToMatch = [
            [["A", "B", "C"], "A"],
            [["A"], "A"],
            [["A", "B"], "A"],
            [["A", "C", "the", "hello", "C", "B", "B", "B"], "B"]
        ];

        valuesToMatch.forEach(
            a => expect(maximumRepeatedString(a[0])).to.be.equal(a[1])
        );

    });

    /** Large Input Cases */
    it("should work under 1s", function() {

        const randomIntegerGenerator = 
            (min, max) => Math.floor(Math.random() * (max - min)) + min;

        /** Generates strings with single uppercase character */
        const randomStringInputGenerator = 
            () => String.fromCharCode(randomIntegerGenerator(65, 90));

        /** Generates large strings of size N */
        const largeInputStringGenerator = 
            N => (randomStringInputGenerator()).repeat(N);

        /** Generates large input array of size N */
        const largeInputGenerator = 
            N => "A".repeat(N)
                    .split("")
                    .map(a => randomIntegerGenerator(0, 10000))
                    .map(largeInputStringGenerator);

        const valuesToMatch = [
            largeInputGenerator(10),
            largeInputGenerator(100),
            largeInputGenerator(1000),
            largeInputGenerator(10000),
        ];

        valuesToMatch.forEach(
            a => {
                const startTime = Date.now();
                maximumRepeatedString(a);
                expect(Date.now() - startTime).to.be.lessThan(1000);
            }
        );

    });

});

describe("Testing maximumRepeatedStringWithMemorization()", function() {

    /** Sanity Cases */
    it("should return the item with maximum frequency", function() {

        const valuesToMatch = [
            [["A", "B", "C", "the", "hello", "B", "C"], "B"],
            [["A", "B", "C", "the", "hello", "hello", "hello"], "hello"],
            [["A", "B", "C", "the", "hello", "K", "C"], "C"],
            [["A", "B", "C", "the", "hello", "C", "B"], "B"],
            [["hello", "B", "C", "the", "hello", "B", "C"], "hello"],
            [["hello", "B", "C", "the", "ZZZ", "ZZZ", "ZZZ"], "ZZZ"],
            [["and", "I", "and", "am", "and", "I", "and"], "and"]
        ];

        valuesToMatch.forEach(
            a => expect(maximumRepeatedStringWithMemorization(a[0])).to.be.equal(a[1])
        );

    });

    /** Invalid value Exception Cases */
    it("should throw exceptions if invalid value array is provided", function() {

        const valuesToMatch = [
            ["A", "B", "C", "the", "hello", new Object(), "hello"],
            ["A", "B", "C", "the", "hello", [], "C"],
            ["A", "B", "C", "the", 866, "C", "B"],
            ["hello", "B", "C", "the", "hello", null, "C"],
            ["hello", "B", undefined, "the", "ZZZ", "ZZZ", "ZZZ"]
        ];

        valuesToMatch.forEach(
            a => expect(() => maximumRepeatedStringWithMemorization(a)).to.throw("Invalid value type provided. Only strings are allowed.")
        );

    });

    /** Empty array Exception Cases */
    it("should throw exceptions if given array is empty", function() {
        expect(() => maximumRepeatedStringWithMemorization([])).to.throw("Given array is empty");
    });

    /** Corner Cases */
    it("should return the first item with maximum frequency", function() {

        const valuesToMatch = [
            [["A", "B", "C"], "A"],
            [["A"], "A"],
            [["A", "B"], "A"],
            [["A", "C", "the", "hello", "C", "B", "B", "B"], "B"]
        ];

        valuesToMatch.forEach(
            a => expect(maximumRepeatedStringWithMemorization(a[0])).to.be.equal(a[1])
        );

    });

    /** Large Input Cases */
    it("should work under 1s", function() {

        const randomIntegerGenerator = 
            (min, max) => Math.floor(Math.random() * (max - min)) + min;

        /** Generates strings with single uppercase character */
        const randomStringInputGenerator = 
            () => String.fromCharCode(randomIntegerGenerator(65, 90));

        /** Generates large strings of size N */
        const largeInputStringGenerator = 
            N => (randomStringInputGenerator()).repeat(N);

        /** Generates large input array of size N */
        const largeInputGenerator = 
            N => "A".repeat(N)
                    .split("")
                    .map(a => randomIntegerGenerator(0, 10000))
                    .map(largeInputStringGenerator);

        const valuesToMatch = [
            largeInputGenerator(10),
            largeInputGenerator(100),
            largeInputGenerator(1000),
            largeInputGenerator(10000),
        ];

        valuesToMatch.forEach(
            a => {
                const startTime = Date.now();
                maximumRepeatedStringWithMemorization(a);
                expect(Date.now() - startTime).to.be.lessThan(1000);
            }
        );

    });

});