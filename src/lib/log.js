class Log {
    info(message) {
        console.log(message)
    }

    error(err) {
        console.error(err)
    }
}

const log = new Log()

module.exports = log;
