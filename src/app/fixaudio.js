const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath.replace('.amr', '.mp3');
const exec = require('child_process').exec;

// ffmpeg -i ZV5P9L_vrfzlzPmy3H3BVKPNvioOzBMRCca3i21NHE8X158R9D8-AlDVS7yALeYp.amr -vn -ar 8000 -ac 2 -ab 192k -f mp3 ZV5P9L_vrfzlzPmy3H3BVKPNvioOzBMRCca3i21NHE8X158R9D8-AlDVS7yALeYp.mp3
const cmd = `ffmpeg -i ${inputPath} -vn -ar 8000 -ac 2 -ab 192k -f mp3 ${outputPath}`;
exec(cmd, (error, stdout, stderr) => {
  if (error) {
    console.log(outputFilePath + ' An error occurred Converting : ' , error);
    return process.exit(1);
  }
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
  return process.exit(0);
});
