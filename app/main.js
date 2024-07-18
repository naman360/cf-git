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
