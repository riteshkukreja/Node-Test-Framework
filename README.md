# NodeJS Test Framework

Test frameworks are the holy grail of application development. But do you know how they work? Most developer do not want to peek under the hood because they fear the magic might fade. Its quite the opposite. Understanding how the holy grail work will definitely give you inspiration that no application is small.

Most of the NodeJs community is divided between Mocha and Jasmine developers. It's the holy war that has been going on for ages. In this post, we will create our own test framework and see how the frameworks work under the hood. And Maybe..Just maybe we can finally put this meaningless war to bed.

> I see now that the Circumstances of one's birth are irrelevant. It is what you do with the gift of life that determines who you are.

## Let's get started
We will divide the entire application into multiple tasks and try to make our application as modular as possible.

### Task 1: Retrieve all the test files
We need all the test file name from "tests" directory for our framework consumption. So let's define the prototype.

```js
const retrieveTestFiles = async (directory) => {
    // Code goes here
};
```

We would need `fs` and `path` module to interact with the file system.
```js
const fs = require("fs");
const path = require("path");
```

Now create the final path to the test directory.
```js
const _testDirectory = directory;
```

Finally we will read all the files and directories inside the test directory and spit out its name.
```js
const files = await new Promise(async (resolve, reject) => {
    fs.readdir(_testDir, (err, files) => {
        if(err) {
            reject(err);
            return;
        }

        resolve(files);
    });
});
```

Now we have test files and directories. Let's traverse recursively all the directories until we just have a lit of files with their full path. We will append the current directory path to the file so we can get `stat` information from the file. Two of the important stat are `isDirectory()` and `isFile()`. Since we are targeting only directories for recursive traversal, we will filter files out. Next recursively call ourselves until we have all the files.

```js
const recursiveWalk = await Promise.all(
    files
        .map(file => path.join(_testDir, file))
        .filter(file => fs.statSync(file).isDirectory())    
        .map(async dir => await retrieveTestFiles(dir))
    );
```

At this point, we merge the recursively obtained files with the files we currently have.
```js
const testFiles = files
    .map(file => path.join(_testDir, file))
    .filter(file => fs.statSync(file).isFile())  
    .concat(recursiveWalk);
```

But Wait! Our `testFiles` array contains subarrays. For each recursive call, we added an array instead of a file. So we do need to flatten the array before returning.
```js
const flatten = list => list.reduce(
    (a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []
);

return flatten(testFiles);
```

Below is the complete method.
```js
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
```

### Task 2: Track all the ran testcases and their results
This will be short step as we just need a data structure to hold the stats of our testcases. Just a simple object will do.
```js
const testSummary = {
    /** Total testcases in all the test files **/
    total: 0,

    /** Passed testcases **/
    passed: 0,

    /** Failed testcases **/
    failed: 0,

    /** All errors encountered **/
    errors: []
};

```

### Test 3: Define our own describe and it method
If you have worked with test fremworks such as Mocha or Jasmine, You would have created your test suites with `describe` method and testcases with `it` method. We will support the same architecture of the test file and define our own `describe` and `it` methods.

#### Describe Method
`describe` defines a single test suite. It receives a callback which contains all the testcases inside this testsuite. It also takes a description or title of test suite. We will print a message on the screen for the test suite and immediately call the testcases of the test suite.

```js
const _describe = (title, callback) => {
    try {
        process.stdout.write(`Suite: ${title}`);

        /** Run the test suite **/
        callback();
    } catch(e) {
        /** In case of error, push to errors list **/
        testSummary.errors.push({title, e});
    }
};
```

#### It Method
`it` method defines a single testcase. Its arguments are similar to `describe` method. We will show a message that we are currently executing this testcase and update the message after we are done.

```js
const _it = (title, callback) => {
    const startTime = Date.now();

    /** Show the starting message **/
    process.stdout.write(`\n${title}: Running Testcases\r`);

    try {
        /** Update the total count of testcases **/
        testSummary.total++;

        /** Execute the testcase **/
        callback();
        

        /** Update the passed count of testcases **/
        testSummary.passed++;
    } catch(e) {
        /** In case of error, push to errors list **/
        testSummary.errors.push({title, e});

        /** Update the failed count of testcases **/
        testSummary.failed++;
    }

    /** Show testcase completion detail with time of execution **/
    process.stdout.write(`${title}: Testcases finished (${Date.now() - starTime}ms)`);
};
```

### Task 4: Run each test file
Now we have to run a single test file by using the above `describe` and `it` methods. We will define signature as,
```js
const runTestFile = (file) => {
    // code goes here
});
```

Since our methods are prefixed with an `_`, we would make a local copy of the method with their expected names.
```js
const describe = _describe;
const it = _it;
```

Now we need content to `eval`. we would again use the `fs` module to retrieve file content.
```js
try {
    const content = fs.readFileSync(file).toString();
    eval(content);
} catch(e) {
    /** push to errors array **/
    testSummary.errors.push({
        title: `Couldn't run ${title}`,
        e
    });
}
```

Below is the complete method.
```js
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
```

### Task 5: Show summary of the result
This will be the simplest sub-task of the entire application. We will just need to print out `total`, `passed` and `failed` statistic of the testcases. We will also show errors here if we have any.
```js
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
```

### Task 6: Plugging things together
Finally, we just need to combine our methods.
```js
const testRunner = async () => {
    // Code goes here
});
```

First, retrieve the testcase files from `retrieveTestFiles` passing the `tests` directory as target.
```js
const files = await retrieveTestFiles(path.join(__dirname, "tests"));
```

Then execute each testcase file using `` method.
```js
files
    .forEach(runTestFile);
```

Finally, we will print the summary.
```js
showSummary();
```

Below is the complete method.
```js
const testRunner = async () => {
    /** Retrieve all testcase files **/
    const files = await retrieveTestFiles(path.join(__dirname, "tests"));

    /** Run each file **/
    files
        .forEach(runTestFile);

    /** Show summary **/
    showSummary();
};

/** Call the method to start **/
testRunner();
```

### Task 7: Testing
Let's test if our test framework really works or not! Create a new directory `tests` inside our root directory. Add a simple test file inside the directory.
```js
const expect = require("chai").expect;

describe("Testing Framework testing", function() {

    it("can add two numbers", function() {
        expect(5+9).to.equal(14);
    });

});
```
After running, we can see that the results are being printed.
```bash
$ node app.js

Suite: Testing Framework testing
can add two numbers: Testcases finished (0ms)


==================================================
Total Tests: 1, Passed: 1, Failed: 0
==================================================

```

### Task 8: Making it pretty
So far our application only prints in white. We need to give visual feedback to show that our testcases passed or not. We will use `chalk` module to do this for us.

```bash
npm install chalk
```

Now let's change out `describe` and `it` methods to use `chalk` colors.
```js
const chalk = require("chalk");

const _describe = (title, callback) => {
    try {
        process.stdout.write(chalk.bgWhite.black(`\nSuite: ${title}`));

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
    process.stdout.write(`\n${title}: Running Testcases\r`);

    try {
        /** Update the total count of testcases **/
        testSummary.total++;

        /** Execute the testcase **/
        callback();
        

        /** Update the passed count of testcases **/
        testSummary.passed++;

        /** Show testcase completion detail with time of execution **/
        process.stdout.write(chalk.green(`${title}: Testcases finished (${Date.now() - starTime}ms)`));
    } catch(e) {
        /** In case of error, push to errors list **/
        testSummary.errors.push({title, e});

        /** Update the failed count of testcases **/
        testSummary.failed++;

        /** Show testcase completion detail with time of execution **/
        process.stdout.write(chalk.red(`${title}: Testcases finished (${Date.now() - starTime}ms)`));
    }
};
```

Now if we run our testcases, we will get something like this.

![Colored Testcase result](colored_tc_framework.png)

## Conclusion
Congratulations! You have successfully build your own testing framework. Now that we know how test frameworks work under the hood, maybe we don't need to fight anymore about which one is better.
Full Source code will be available on [GitHub](https://github.com/riteshkukreja/Node-Test-Framework).
