const { exec } = require("child_process");

module.exports = (command, args) => {
    return new Promise((resolve, reject) => {
        exec(command, args, (err, stdout, stderr) => {
            if (err) {
                reject(stderr);
            }

            resolve(stdout);
        });
    });
};