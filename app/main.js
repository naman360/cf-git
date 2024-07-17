const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this block to pass the first stage
const command = process.argv[2];
//
switch (command) {
  case "init":
    createGitDirectory();
    break;
  case "cat-file":
    const hash = process.argv[4];
    catFile(hash);
    break;
  default:
    throw new Error(`Unknown command ${command}`);
}

function createGitDirectory() {
  fs.mkdirSync(path.join(process.cwd(), ".git"), { recursive: true });
  fs.mkdirSync(path.join(process.cwd(), ".git", "objects"), {
    recursive: true,
  });
  fs.mkdirSync(path.join(process.cwd(), ".git", "refs"), { recursive: true });

  fs.writeFileSync(
    path.join(process.cwd(), ".git", "HEAD"),
    "ref: refs/heads/main\n"
  );

  console.log("Initialized git directory");
  function catFile(hash) {
    const content = fs.readFileSync(
      path.join(
        process.cwd(),
        ".git",
        "objects",
        hash.slice(0, 2),
        hash.slice(2)
      )
    );
    const decompressedData = zlib.inflateSync(content);
    const output = decompressedData.split("\0")[1];
    process.stdout.write(output);
  }
}
