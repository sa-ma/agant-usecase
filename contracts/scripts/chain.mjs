import { ethers } from "ethers";

const [cmd, ...args] = process.argv.slice(2);
const rpcUrl = process.env.CHAIN_RPC_URL || "http://127.0.0.1:8545";
const privateKey = process.env.CHAIN_PRIVATE_KEY;
const contractAddress = process.env.CHAIN_CONTRACT_ADDRESS;

if (!cmd) {
  console.error("Missing command");
  process.exit(1);
}

if (!contractAddress) {
  console.error("Missing CHAIN_CONTRACT_ADDRESS");
  process.exit(1);
}

const provider = new ethers.JsonRpcProvider(rpcUrl);
const signer = privateKey ? new ethers.Wallet(privateKey, provider) : null;

const abi = [
  "function mint(address to, uint256 amount)",
  "function burn(address from, uint256 amount)",
  "function pause()",
  "function unpause()",
  "function freeze(address user)",
  "function unfreeze(address user)",
  "function paused() view returns (bool)",
  "function frozen(address user) view returns (bool)",
  "event Minted(address indexed to, uint256 amount)",
  "event Burned(address indexed from, uint256 amount)",
  "event AddressFrozen(address indexed user)",
  "event AddressUnfrozen(address indexed user)",
  "event Paused(address account)",
  "event Unpaused(address account)"
];

const contract = new ethers.Contract(contractAddress, abi, signer || provider);

async function sendTx(action) {
  if (!signer) {
    console.error("Missing CHAIN_PRIVATE_KEY");
    process.exit(1);
  }
  const tx = await action();
  const receipt = await tx.wait();
  console.log(JSON.stringify({ hash: tx.hash, blockNumber: receipt.blockNumber }));
}

async function fetchEvents(fromBlock, toBlock) {
  const latest = await provider.getBlockNumber();
  const endBlock = toBlock ?? latest;
  const events = [];

  const filters = [
    { name: "Minted", filter: contract.filters.Minted() },
    { name: "Burned", filter: contract.filters.Burned() },
    { name: "AddressFrozen", filter: contract.filters.AddressFrozen() },
    { name: "AddressUnfrozen", filter: contract.filters.AddressUnfrozen() },
    { name: "Paused", filter: contract.filters.Paused() },
    { name: "Unpaused", filter: contract.filters.Unpaused() }
  ];

  for (const entry of filters) {
    const logs = await contract.queryFilter(entry.filter, fromBlock, endBlock);
    for (const log of logs) {
      events.push({
        event: entry.name,
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        args: log.args ? Object.values(log.args).map((v) => v?.toString()) : []
      });
    }
  }

  console.log(JSON.stringify({ fromBlock, toBlock: endBlock, events }));
}

switch (cmd) {
  case "mint": {
    const [to, amount] = args;
    await sendTx(() => contract.mint(to, amount));
    break;
  }
  case "burn": {
    const [from, amount] = args;
    await sendTx(() => contract.burn(from, amount));
    break;
  }
  case "pause": {
    await sendTx(() => contract.pause());
    break;
  }
  case "unpause": {
    await sendTx(() => contract.unpause());
    break;
  }
  case "freeze": {
    const [user] = args;
    await sendTx(() => contract.freeze(user));
    break;
  }
  case "unfreeze": {
    const [user] = args;
    await sendTx(() => contract.unfreeze(user));
    break;
  }
  case "events": {
    const fromBlock = parseInt(args[0] || "0", 10);
    const toBlock = args[1] ? parseInt(args[1], 10) : undefined;
    await fetchEvents(fromBlock, toBlock);
    break;
  }
  case "paused": {
    const paused = await contract.paused();
    console.log(JSON.stringify({ paused }));
    break;
  }
  case "frozen": {
    const [user] = args;
    if (!user) {
      console.error("Missing address");
      process.exit(1);
    }
    const frozen = await contract.frozen(user);
    console.log(JSON.stringify({ frozen }));
    break;
  }
  default:
    console.error(`Unknown command: ${cmd}`);
    process.exit(1);
}
