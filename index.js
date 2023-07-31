const keccak256 = require("keccak256");
const { default: MerkleTree } = require("merkletreejs");
const bodyParser = require("body-parser");
const multer  = require('multer')
const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));


const corsOptions = {
  origin: "*",
};
app.use(cors(corsOptions));

//  init whitlists
const address = [];
const allFileContents = fs.readFileSync("address.txt", "utf-8");
allFileContents.split(/\r?\n/).forEach((line) => {
  address.push(line);
});

//  Hashing All Leaf Individual
const leaves = address.map((leaf) => keccak256(leaf));

// Constructing Merkle Tree
const tree = new MerkleTree(leaves, keccak256, {
  sortPairs: true,
});

//  Utility Function to Convert From Buffer to Hex
const buf2Hex = (x) => "0x" + x.toString("hex");

// Get Root of Merkle Tree
console.log(`Here is Root Hash: ${buf2Hex(tree.getRoot())}`);

// Write whiteList.json file in root dir

app.post("/proof", multer().none(),async (req, res) => {
  if (!req.body) return;
  const address = req.body.address;
  const leaf = keccak256(address);

  const proof = tree.getProof(leaf);

  let tempData = [];

  proof.map((x) => tempData.push(buf2Hex(x.data)));
  res.send({ proof: tempData });
});

app.listen(process.env.PORT || 5000, async () => {
  console.log("Server is up and running on port numner");
});
