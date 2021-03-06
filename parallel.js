const path = require("path");
const fs = require("fs");
const chalk = require("chalk");
const cluster = require("cluster");

/**
 * NODEJS PARALLEL TEST RUNNER
 * 
 * 1. Retrive all the test files from the "tests" directory
 * 2. Track all the ran testcases and their results
 * 3. Define our own describe and it method
 * 4. Run each test file in seperate process
 * 5. Show summary of the result
 * 6. Show errors if any
 */

/** Retrive all the test files from the "tests" directory */
const retrieveTestFiles = async (directory) => {
    const _testDir = directory;

    /** Retrieve all the files and directories inside the current directory **/
    const files = await new Promise(async (resolve, reject) => {
        fs.readdir(_testDir, (err, files) => {
            if(err) {
                reject(err);
                return;
            }

            resolve(files);
        });
    });

    /** Recursively navigate to all directories inside current directory and extract files **/
    const recursiveWalk = await Promise.all(
        files
            .map(file => path.join(_testDir, file))
            .filter(file => fs.statSync(file).isDirectory())    
            .map(async dir => await retrieveTestFiles(dir))
        );

    /** Concat all the test files in current directory with all the files found with recursive nagivation **/
    const testFiles = files
        .map(file => path.join(_testDir, file))
        .filter(file => fs.statSync(file).isFile())  
        .concat(recursiveWalk);

    /** Flatten an array **/
    const flatten = list => list.reduce(
        (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
    );

    /** Return the flattened array **/
    return flatten(testFiles);
};

/** Track all the ran testcases and their results */
const testSummary = {
    /** Total testcases in all the test files **/
    total: 0,

    /** Passed testcases **/
    passed: 0,

    /** Failed testcases **/
    failed: 0,

    /** All errors encountered **/
    errors: [],

    /** All outputs */
    outputs: []
};

/** Define our own describe and it method */
const _describe = (title, callback) => {
    try {
        testSummary.outputs.push(chalk.bgWhite.black(`\nSuite: ${title}`));

        /** Run the test suite **/
        callback();
    } catch(e) {
        /** In case of error, push to errors list **/
        testSummary.errors.push({title, e});
    }
};

const _it = (title, callback) => {
    const startTime = Date.now();

    /** Show the starting message **/
    testSummary.outputs.push(chalk.yellow(`\n${title}: Running Testcases\r`));

    try {
        /** Update the total count of testcases **/
        testSummary.total++;

        /** Execute the testcase **/
        callback();

        /** Update the passed count of testcases **/
        testSummary.passed++;

        /** Show testcase completion detail with time of execution **/
        testSummary.outputs.push(chalk.green(`${title}: Testcases finished (${Date.now() - startTime}ms)`));
    } catch(e) {
        /** In case of error, push to errors list **/
        testSummary.errors.push({title, e});

        /** Update the failed count of testcases **/
        testSummary.failed++;

        /** Show testcase completion detail with time of execution **/
        testSummary.outputs.push(chalk.red(`${title}: Testcases finished (${Date.now() - startTime}ms)`));
    }
};

/** Run each test file */
const runTestFile = (file) => {
    const describe = _describe;
    const it = _it;

    try {
        const content = fs.readFileSync(file).toString();
        eval(content);
    } catch(e) {
        testSummary.errors.push({
            title: `Couldn't run ${title}`,
            e
        });
    }
};

/** Show outputs **/
const showOutputs = (testSummary) => {
    testSummary.outputs
        .forEach(err => process.stdout.write(err));
};

/** Show errors **/
const showErrors = () => {
    testSummary.errors
        .map(err => `${err.title}: \n\t${err.e}\n`)
        .forEach(err => console.error(err));
};

/** Show summary **/
const showSummary = () => {
    console.log("\n\n");
    console.log("==================================================");
    console.log(`Total Tests: ${testSummary.total}, Passed: ${testSummary.passed}, Failed: ${testSummary.failed}`);
    console.log("==================================================");

    showErrors();
};

const testRunner = async () => {
    
    if(cluster.isMaster) {
        /** Retrieve all testcase files **/
        const files = await retrieveTestFiles(path.join(__dirname, "tests"));

        const workers = [];
        const tasks = files.slice();

        for(let i = 0; i < tasks.length; i++) {
            const worker = cluster.fork();
            workers.push(worker);

            worker.on('message', (msg) => {
                const summary = msg.result;

                showOutputs(summary);

                testSummary.total += summary.total;
                testSummary.passed += summary.passed;
                testSummary.failed += summary.failed;

                testSummary.errors = testSummary.errors.concat(summary.errors);
            });
        }

        for(let i = 0; i < workers.length && tasks.length > 0; i++) {
            const task = tasks.pop();
            workers[i].send({ task });
        }

        cluster.on('death', (worker) => console.log(`Worker died: ${worker.pid}`));
        process.on('exit', showSummary);
    } else {

        process.on('message', (msg) => {
            runTestFile(msg.task);

            process.send({ result: testSummary });
            process.exit();
        });

    }
};

testRunner();