/**
 * This code is adapted from https://github.com/bfricka/node-git-tags/blob/master/src/git-tags.js
 * That package is not maintained.
 */
const _ = require('lodash');
const path = require('path');
const semver = require('semver');
const execPromise = require('./utilities/execPromise');

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
            throw e;
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