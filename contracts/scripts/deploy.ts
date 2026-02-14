import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const Factory = await ethers.getContractFactory("GBPStablecoin");
  const token = await Factory.deploy(deployer.address);
  await token.waitForDeployment();
  const address = await token.getAddress(); 

  console.log(address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
