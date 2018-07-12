#!/usr/bin/env node

const gittags = require("./git-tags");
const inquirer = require("inquirer");
const semverRegex = require("semver-regex");
const chalk = require("chalk");
const exec = require("child_process").exec;

const PARTS = {
    patch: 2,
    minor: 1,
    major: 0
};

const questions = [{
    type: "list",
    name: "part",
    message: "Which part of the version you want to bump?",
    choices: ["Patch (?.?.x)", "Minor (?.x.?)", "Major (x.?.?)"]
}];

gittags.latest().then(tag => {
    if (!tag || !semverRegex().test(tag)) {
        console.log(chalk.red("You do not have any version following semver yet!"));
        console.log(
            "You have to create one first. E.g. " + chalk.green("git tag 0.0.1")
        );

        process.exit(1);
    }

    console.log(chalk.yellow("Current version: "), chalk.black.bgYellow(tag));

    // prompt for what part of the version you want to bump.
    inquirer.prompt(questions).then(answer => {
        version = semverRegex().exec(tag)[0];
        bumped = getBumbedVersion(version, answer.part);
        // create new git tag
        exec(`git tag ${bumped}`, (error, stdout, stderr) => {
            if (error) {
                console.log(
                    chalk.red("Could not create"),
                    chalk.red.bold(bumped),
                    chalk.red("tag")
                );
                console.log(stderr);
                process.exit(1);
            }

            console.log(
                chalk.green("Bumped version to "),
                chalk.bgGreen.black(bumped)
            );
        });
    });
}).catch(err => {
    throw err;
});

function parseVersionPart(partString) {
    return PARTS[partString.toLowerCase().substr(0, 5)];
}

function getBumbedVersion(version, part) {
    versionIndex = parseVersionPart(part);
    versionParts = version.split(".");
    versionParts[versionIndex] = parseInt(versionParts[versionIndex]) + 1;
    if (versionIndex <= 1) {
        versionParts[2] = 0;
    }
    if (versionIndex == 0) {
        versionParts[1] = 0;
    }

    return versionParts.join(".");
}