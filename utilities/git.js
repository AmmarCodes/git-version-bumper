const execPromise = require('./execPromise');

const parseConfig = data => {
    const config = {};

    data.split('\n')
        .forEach(item => {
            let key = item.substring(0, item.indexOf('=')).trim();
            let value = item.substring(item.indexOf('=') + 1).trim();

            if (key.length > 0 && value.length > 0) {
                config[key] = value;
            }
        });

    return config;
};

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

const getRepoConfig = repo => {
    return execPromise('git config --local -l', { cwd: repo }).then(config => {
        return parseConfig(config);
    });
};

module.exports = {
    getTags,
    createTag,
    getRepoConfig
};