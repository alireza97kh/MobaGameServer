const fs = require('fs');

// Define a function to log messages to a file
function logToFile(message, LogfileName) {
    const date = new Date(Date.now());
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString().substr(-2);
    const hours = date.getHours().toString().padStart(2, '0');

    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const formattedDate = `${year}/${month}/${day} -> ${hours}:${minutes}:${seconds}`;
    const logLine = `${formattedDate}: ${message}\n`;

    fs.appendFile(LogfileName + '.txt', logLine, (err) => {
        if (err) {
        console.error('Error writing to log file:', err);
        }
    });
}
function clearLogFile(LogfileName) {
    fs.writeFile(LogfileName + '.txt', '', (err) => {
      if (err) {
        console.error('Error clearing log file:', err);
      }
    });
  }
  
module.exports = { logToFile, clearLogFile };