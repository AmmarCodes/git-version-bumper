/**
 * This is copied from https://github.com/bfricka/node-git-tags/blob/master/src/git-tags.js
 * That package is not maintained.
 */
const _ = require('lodash');
const path = require('path');
const exec = require('child_process').exec;
const semver = require('semver');

const execPromise = (command, args) => {
    return new Promise((resolve, reject) => {
        exec(command, args, (err, stdout, stderr) => {
            if (err) {
                reject(stderr);
            }

            resolve(stdout);
        });
    });
};

const getTags = repo => {
    return execPromise('git tag', { cwd: repo }).then(stdout => {
        return stdout.toString();
    });
}

const parseTags = data => {
    return _.compact(data.split('\n'))
        .filter(semver.valid)
        .sort(semver.compare)
        .reverse();
}

const filterTags = repo => {
    return getTags(repo).then(tags => {
        try {
            tags = parseTags(tags);
        } catch (e) {
            return cb(e)
        }
    });
}

const normalizeFn = fn => {
    return repo => {
        return new Promise((resolve, reject) => {
            if (!repo) {
                repo = process.cwd();
            }
    
            if (repo.charAt(0) === '.') {
                repo = path.resolve(repo);
            }
    
            filterTags(repo).then(tags => {
                resolve(fn(tags));
            }).catch(error => {
                reject(error);
            })
        });
    };
}

const ret = arg => {
    return arg;
}

module.exports = {
    get: normalizeFn(ret),
    latest: normalizeFn(_.first),
    oldest: normalizeFn(_.last),
    parse: semver.parse,
    mmp: function (tag) {
        var p = semver.parse(tag);
        return [p.major, p.minor, p.patch].join('.');
    }
};