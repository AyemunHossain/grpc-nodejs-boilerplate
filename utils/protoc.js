const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

// Adjust paths relative to the current directory (utils folder)
const protoDir = path.join(__dirname, '../models');
const outputDir = path.join(__dirname, '../protos');

// Ensure output directory exists
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to generate gRPC files for a .proto file
function generateGrpcFiles(protoFile) {
  console.log(`Generating gRPC files for ${protoFile}...`);
  
  // Use protoc to run the command
  const command = `protoc -I=${protoDir} ${protoFile} --js_out=import_style=commonjs,binary:${outputDir} --grpc_out=grpc_js:${outputDir} --plugin=protoc-gen-grpc=$(which grpc_tools_node_protoc_plugin)`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating gRPC files for ${protoFile}: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`stderr: ${stderr}`);
      return;
    }
    console.log(`gRPC files generated successfully for ${protoFile}`);
  });
}

// Check each .proto file in the proto directory
fs.readdir(protoDir, (err, files) => {
  if (err) {
    console.error(`Failed to read proto directory: ${err.message}`);
    return;
  }

  files.forEach(file => {
    if (path.extname(file) === '.proto') {
      generateGrpcFiles(path.join(protoDir, file));
    }
  });
});