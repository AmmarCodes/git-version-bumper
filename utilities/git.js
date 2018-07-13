const execPromise = require('./execPromise');

const getTags = repo => {
    return execPromise('git tag', { cwd: repo }).then(stdout => {
        return stdout.toString();
    });
}

const createTag = tag => {
    return execPromise(`git tag ${tag}`).then(stdout => {
        return stdout.toString();
    });
};

module.exports = {
    getTags,
    createTag
};