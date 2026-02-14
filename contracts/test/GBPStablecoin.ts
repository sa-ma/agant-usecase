import { expect } from "chai";
import { ethers } from "hardhat";

const oneToken = ethers.parseUnits("1", 18);

describe("GBPStablecoin", () => {
  it("allows only minter to mint", async () => {
    const [admin, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("GBPStablecoin");
    const token = await Factory.deploy(admin.address);
    await token.waitForDeployment();

    await expect(token.connect(other).mint(other.address, oneToken)).to.be.reverted;
    await expect(token.connect(admin).mint(other.address, oneToken))
      .to.emit(token, "Minted")
      .withArgs(other.address, oneToken);
  });

  it("allows only burner to burn", async () => {
    const [admin, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("GBPStablecoin");
    const token = await Factory.deploy(admin.address);
    await token.waitForDeployment();

    await token.connect(admin).mint(other.address, oneToken);
    await expect(token.connect(other).burn(other.address, oneToken)).to.be.reverted;
    await expect(token.connect(admin).burn(other.address, oneToken))
      .to.emit(token, "Burned")
      .withArgs(other.address, oneToken);
  });

  it("pausing blocks transfers and mint/burn", async () => {
    const [admin, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("GBPStablecoin");
    const token = await Factory.deploy(admin.address);
    await token.waitForDeployment();

    await token.connect(admin).mint(admin.address, oneToken);
    await token.connect(admin).pause();

    await expect(token.connect(admin).transfer(other.address, oneToken)).to.be.reverted;
    await expect(token.connect(admin).mint(other.address, oneToken)).to.be.reverted;
    await expect(token.connect(admin).burn(admin.address, oneToken)).to.be.reverted;
  });

  it("freezing blocks transfers", async () => {
    const [admin, other] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("GBPStablecoin");
    const token = await Factory.deploy(admin.address);
    await token.waitForDeployment();

    await token.connect(admin).mint(admin.address, oneToken);
    await token.connect(admin).freeze(admin.address);

    await expect(token.connect(admin).transfer(other.address, oneToken)).to.be.reverted;
  });
});
