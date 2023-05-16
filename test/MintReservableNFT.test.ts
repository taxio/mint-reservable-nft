import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("MintReservableNFT", () => {
  it("story", async () => {
    const [owner, user1, user2, user3] = await ethers.getSigners();
    const MintReservableNFT = await ethers.getContractFactory("MintReservableNFT");

    const mintReservableNFT = await MintReservableNFT.deploy(
      "Test", "TS", ethers.utils.parseEther("1"), 2
    );

    await expect(
      mintReservableNFT.connect(user1).reserveMint({value: ethers.utils.parseEther("1")})
    ).to.not.reverted;
    expect(await mintReservableNFT.reserved()).to.equal(1);

    await expect(
      mintReservableNFT.connect(user2).reserveMint({value: ethers.utils.parseEther("0.1")})
    ).to.be.revertedWith("Invalid value");

    await expect(
      mintReservableNFT.connect(user1).cancelReservation()
    ).to.not.reverted;
    expect(await mintReservableNFT.reserved()).to.equal(0);

    await expect(
      mintReservableNFT.connect(user2).reserveMint({value: ethers.utils.parseEther("1")})
    ).to.not.reverted;
    await expect(
      mintReservableNFT.connect(user2).reserveMint({value: ethers.utils.parseEther("1")})
    ).to.not.reverted;
    expect(await mintReservableNFT.reserved()).to.equal(2);
    expect(await mintReservableNFT.hasAchieved()).to.be.true;
    expect(
      await ethers.provider.getBalance(mintReservableNFT.address)
    ).to.equal(ethers.utils.parseEther("2"));

    await expect(
      mintReservableNFT.connect(user2).cancelReservation()
    ).to.be.revertedWith("Mint target achieved");

    await expect(
      mintReservableNFT.connect(user2).mint()
    ).to.not.reverted;
    expect(await mintReservableNFT.ownerOf(0)).to.equal(user2.address);

    await expect(
      mintReservableNFT.connect(user1).mint()
    ).to.be.revertedWith("Not reserved");

    await expect(
      mintReservableNFT.connect(user2).mint()
    ).to.not.reverted;
    expect(await mintReservableNFT.ownerOf(1)).to.equal(user2.address);

    await expect(
      mintReservableNFT.connect(user2).mint()
    ).to.be.revertedWith("Not reserved");

    await expect(
      mintReservableNFT.withdraw(
        owner.address,
        ethers.provider.getBalance(mintReservableNFT.address)
      )
    ).to.not.reverted;
  });
});
