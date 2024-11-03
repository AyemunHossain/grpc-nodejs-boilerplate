const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// Path to the shell script
const scriptPath = path.join(__dirname, 'gen_certs.sh');

// Change the permissions of the shell script to make it executable
fs.chmod(scriptPath, '755', (err) => {
  if (err) {
    console.error(`Error changing permissions: ${err.message}`);
    return;
  }

  console.log('Permissions changed successfully.');

  // Execute the shell script
  exec(`sh ${scriptPath}`, (err, stdout, stderr) => {
    if (err) {
      console.error(`Error executing script: ${err.message}`);
      return;
    }

    if (stderr) {
      console.error(`Script error: ${stderr}`);
      return;
    }

    console.log(`Script output: ${stdout}`);
  });
});