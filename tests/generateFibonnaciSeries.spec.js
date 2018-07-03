const expect = require("chai").expect;

/**
 * It generates a string of fibonnaci series from 0 to N.
 * It throws exception if N is negative or greater than 33.
 * Time Complexity: O(N)
 * Space Complexity: O(N)
 * 
 * @param {Number} N Number upto which fibonnaci series should be generated
 */
const generateFibonnaciSeries = (N) => {
    if(N == undefined || N == null || typeof N !== "number" || N < 0 || N > 33)
        throw new Error("N should be a positive number less than or equal to 33");

    if(N == 0) 
        return "0";

    const series = [0, 1];

    let first = 0,
        second = 1;

    for(let i = 1; i < N; i++) {
        const third = first + second;
        first = second;
        second = third;

        series.push(second + "");
    }
    
    return series.join("");
};

/** Test Cases */
describe("Testing generateFibonnaciSeries()", function() {

    /** Sanity Cases */
    it("should return the generated series", function() {

        const valuesToMatch = [
            [0,'0'],
            [1,'01'],
            [2,'011'],
            [3,'0112'],
            [7,'011235813'],
            [8,'01123581321'],
            [12,'01123581321345589144'],
            [21,'01123581321345589144233377610987159725844181676510946'],
            [28,'0112358132134558914423337761098715972584418167651094617711286574636875025121393196418317811'],
            [30,'0112358132134558914423337761098715972584418167651094617711286574636875025121393196418317811514229832040'],
            [31,'01123581321345589144233377610987159725844181676510946177112865746368750251213931964183178115142298320401346269'],
            [32,'011235813213455891442333776109871597258441816765109461771128657463687502512139319641831781151422983204013462692178309']
        ];

        valuesToMatch.forEach(
            ([req, res]) => expect(generateFibonnaciSeries(req)).to.be.equal(res)
        );

    });

    /** Invalid value Exception Cases */
    it("should throw exceptions if invalid value is provided", function() {

        const valuesToMatch = [
            -4355,
            34, 
            10000,
            -1,
            null,
            undefined,
            new Object(),
            {},
            []
        ];

        valuesToMatch.forEach(
            a => expect(() => generateFibonnaciSeries(a)).to.throw("N should be a positive number less than or equal to 33")
        );

    });

});