/**
 * This is copied from https://github.com/bfricka/node-git-tags/blob/master/src/git-tags.js
 * That package is not maintained.
 */
var _ = require('lodash');
var path = require('path');
var exec = require('child_process').exec;
var semver = require('semver');

function getTags(repo, cb) {
    exec('git tag', {
        cwd: repo
    }, function (err, stdout, stderr) {
        if (err) return cb(err);
        return cb(null, stdout.toString());
    });
}

function parseTags(data) {
    return _.compact(data.split('\n'))
        .filter(semver.valid)
        .sort(semver.compare)
        .reverse();
}

function filterTags(repo, cb) {
    getTags(repo, function (err, tags) {
        if (err) {
            return cb(err)
        }

        try {
            tags = parseTags(tags);
        } catch (e) {
            return cb(e)
        }

        cb(null, tags);
    });
}

function normalizeFn(fn) {
    return function (repo, cb) {
        if (cb == null) {
            cb = repo;
            repo = process.cwd();
        }

        if (!repo) {
            repo = process.cwd();
        }

        if (repo.charAt(0) === '.') {
            repo = path.resolve(repo);
        }

        filterTags(repo, function (err, tags) {
            if (err) return cb('Error getting Git tags:\n' + err);
            return cb(null, fn(tags));
        });
    };
}

function ret(arg) {
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