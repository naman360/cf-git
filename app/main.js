const fs = require("fs");
const path = require("path");
const zlib = require("zlib");
const crypto = require("crypto");
// You can use print statements as follows for debugging, they'll be visible when running tests.

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
  case "hash-object":
    const fileName = process.argv[4];
    createBlob(fileName);
    break;
  case "ls-tree":
    const treeHash = process.argv[4];
    readTree();
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
}
async function catFile(hash) {
  const content = await fs.readFileSync(
    path.join(process.cwd(), ".git", "objects", hash.slice(0, 2), hash.slice(2))
  );
  const dataUnzipped = zlib.inflateSync(content);
  const res = dataUnzipped.toString().split("\0")[1];
  process.stdout.write(res);
}

function createBlob(fileName) {
  // Read file
  const fileContent = fs.readFileSync(fileName, "utf-8");
  const data = `blob ${fileContent.length}\0` + fileContent;
  const hash = crypto.createHash("sha1").update(data).digest("hex");

  const hashDirPath = path.join(
    process.cwd(),
    ".git",
    "objects",
    hash.slice(0, 2)
  );

  const filePath = path.join(hashDirPath, hash.slice(2));
  fs.mkdirSync(hashDirPath, { recursive: true });
  fs.writeFileSync(filePath, zlib.deflateSync(data));
  process.stdout.write(hash);
}

function readTree() {
  const isNameOnly = process.argv[3];
  let hash = "";
  if (isNameOnly === "--name-only") {
    //display the name only
    hash = process.argv[4];
  } else {
    hash = process.argv[3];
  }
  const dirName = hash.slice(0, 2);
  const fileName = hash.slice(2);
  const objectPath = path.join(
    process.cwd(),
    ".git",
    "objects",
    dirName,
    fileName
  );
  const dataFromFile = fs.readFileSync(objectPath);
  //decrypt the data from the file
  const inflated = zlib.inflateSync(dataFromFile);
  //notice before encrypting the data what we do was we encrypt
  //blob length/x00 so to get the previous string back what we need to do is split with /xoo
  const enteries = inflated.toString("utf-8").split("\x00");
  //enteries will be [blob length/x00, actual_file_content]
  const dataFromTree = enteries.slice(1);

  const names = dataFromTree
    .filter((line) => {
      return line.includes(" ");
    })
    .map((line) => {
      return line.split(" ")[1];
    });

  const namesString = names.join("\n");
  const response = namesString.concat("\n");
  //this is the regex pattern that tells to replace multiple global \n with single \n
  process.stdout.write(response.replace(/\n\n/g, "\n"));
}
