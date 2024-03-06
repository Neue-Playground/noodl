const readline = require('node:readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});
const fs = require('node:fs');
readline.question(`File to refactor: `, file => {
  console.log(`Refactoring ${file}...`);
  if (file === '') {
    fs.readdir("./", (err, files) => {
      files.forEach(file => {
        if (file.includes('refactor')) return;
        refactorFile(file);
      });
    });
  } else if (!fs.existsSync(`./${file}.js`)) {
    console.log("File does not exist");
  } else {
    refactorFile(`${file}.js`);
  }
  readline.close();
  console.log(`Refactored ${file}`)

});

function refactorFile (file) {
  fs.readFile(`./${file}`, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    const node = require(`./${file}`);
    if (node.node && node.node.inputs) {
      for (let [key, value] of Object.entries(node.node.inputs)) {
        data = data.replace("." + key, `["${value.displayName}"]`)
        data = data.replace(key, `"${value.displayName}"`)
      }
    }
    if (node.node && node.node.outputs) {
      for (let [key, value] of Object.entries(node.node.outputs)) {
        data = data.replace("." + key, `["${value.displayName}"]`)
        data = data.replace(key + ":", `"${value.displayName}":`)
      }
    }
    // console.log(data, "lol")
    fs.writeFileSync(`./${file}`, data, 'utf8', (err) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  });
}