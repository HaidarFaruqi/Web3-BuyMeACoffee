const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BuyMeACoffee", function () {
  let buyMeACoffee;
  let owner;
  let addr1;
  let addr2;
  let priceFeedAddress;

  // Sepolia ETH/USD Price Feed address
  const SEPOLIA_PRICE_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

  beforeEach(async function () {
    // Get signers
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy contract
    const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
    priceFeedAddress = SEPOLIA_PRICE_FEED;
    buyMeACoffee = await BuyMeACoffee.deploy(priceFeedAddress);
    await buyMeACoffee.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await buyMeACoffee.owner()).to.equal(owner.address);
    });

    it("Should initialize with correct USD to IDR rate", async function () {
      expect(await buyMeACoffee.usdToIdrPrice()).to.equal(15000);
    });

    it("Should set correct constants", async function () {
      expect(await buyMeACoffee.MAX_NAME_LENGTH()).to.equal(100);
      expect(await buyMeACoffee.MAX_MESSAGE_LENGTH()).to.equal(500);
      expect(await buyMeACoffee.MIN_USD_TO_IDR_RATE()).to.equal(1000);
      expect(await buyMeACoffee.MAX_USD_TO_IDR_RATE()).to.equal(100000);
    });

    it("Should reject deployment with zero address for price feed", async function () {
      const BuyMeACoffee = await ethers.getContractFactory("BuyMeACoffee");
      await expect(
        BuyMeACoffee.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid price feed address");
    });
  });

  describe("Update USD to IDR Price", function () {
    it("Should allow owner to update USD to IDR price", async function () {
      const newRate = 16000;
      await expect(buyMeACoffee.updateUsdToIdrPrice(newRate))
        .to.emit(buyMeACoffee, "UsdToIdrRateUpdated")
        .withArgs(15000, newRate, owner.address);

      expect(await buyMeACoffee.usdToIdrPrice()).to.equal(newRate);
    });

    it("Should reject update from non-owner", async function () {
      await expect(
        buyMeACoffee.connect(addr1).updateUsdToIdrPrice(16000)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should reject rate below minimum", async function () {
      await expect(
        buyMeACoffee.updateUsdToIdrPrice(500)
      ).to.be.revertedWith("Rate must be between 1000 and 100000");
    });

    it("Should reject rate above maximum", async function () {
      await expect(
        buyMeACoffee.updateUsdToIdrPrice(150000)
      ).to.be.revertedWith("Rate must be between 1000 and 100000");
    });
  });

  describe("Get Latest ETH to USD Price", function () {
    it("Should return a valid ETH/USD price", async function () {
      // This will call the actual Sepolia price feed
      // We just check it returns a positive number
      const price = await buyMeACoffee.getLatestEthToUsdPrice();
      expect(price).to.be.gt(0);
    });
  });

  describe("IDR to ETH Conversion", function () {
    it("Should convert IDR to ETH correctly", async function () {
      const idrAmount = 150000; // 150,000 IDR
      const ethAmount = await buyMeACoffee.idrToEth(idrAmount);

      // Should return a positive value in wei
      expect(ethAmount).to.be.gt(0);
    });

    it("Should reject zero IDR amount", async function () {
      await expect(
        buyMeACoffee.idrToEth(0)
      ).to.be.revertedWith("IDR amount must be greater than zero");
    });

    it("Should handle large IDR amounts", async function () {
      const largeIdrAmount = ethers.parseEther("1000000"); // 1 million IDR
      const ethAmount = await buyMeACoffee.idrToEth(largeIdrAmount);
      expect(ethAmount).to.be.gt(0);
    });
  });

  describe("Buy Coffee", function () {
    it("Should allow user to buy coffee with valid inputs", async function () {
      const name = "Alice";
      const message = "Great work!";
      const idrAmount = 50000; // 50,000 IDR

      // Calculate required ETH
      const requiredEth = await buyMeACoffee.idrToEth(idrAmount);

      // Buy coffee
      await expect(
        buyMeACoffee.connect(addr1).buyCoffeeInIdr(name, message, idrAmount, {
          value: requiredEth
        })
      )
        .to.emit(buyMeACoffee, "NewMemo")
        .withArgs(addr1.address, await time.latest() + 1, name, message);

      // Check memo was stored
      const memos = await buyMeACoffee.getMemos();
      expect(memos.length).to.equal(1);
      expect(memos[0].name).to.equal(name);
      expect(memos[0].message).to.equal(message);
      expect(memos[0].from).to.equal(addr1.address);
    });

    it("Should refund excess ETH", async function () {
      const name = "Bob";
      const message = "Keep it up!";
      const idrAmount = 50000;

      const requiredEth = await buyMeACoffee.idrToEth(idrAmount);
      const excessEth = ethers.parseEther("0.01");
      const totalSent = requiredEth + excessEth;

      const balanceBefore = await ethers.provider.getBalance(addr1.address);

      const tx = await buyMeACoffee
        .connect(addr1)
        .buyCoffeeInIdr(name, message, idrAmount, { value: totalSent });

      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const balanceAfter = await ethers.provider.getBalance(addr1.address);

      // Balance should decrease by approximately requiredEth + gas (not totalSent)
      const expectedDecrease = requiredEth + gasUsed;
      const actualDecrease = balanceBefore - balanceAfter;

      // Allow 0.1% margin for rounding
      expect(actualDecrease).to.be.closeTo(expectedDecrease, expectedDecrease / 1000n);
    });

    it("Should reject empty name", async function () {
      await expect(
        buyMeACoffee.connect(addr1).buyCoffeeInIdr("", "Message", 50000, {
          value: ethers.parseEther("0.01")
        })
      ).to.be.revertedWith("Name cannot be empty");
    });

    it("Should reject name longer than 100 characters", async function () {
      const longName = "a".repeat(101);
      await expect(
        buyMeACoffee.connect(addr1).buyCoffeeInIdr(longName, "Message", 50000, {
          value: ethers.parseEther("0.01")
        })
      ).to.be.revertedWith("Name too long (max 100 chars)");
    });

    it("Should reject message longer than 500 characters", async function () {
      const longMessage = "a".repeat(501);
      await expect(
        buyMeACoffee.connect(addr1).buyCoffeeInIdr("Alice", longMessage, 50000, {
          value: ethers.parseEther("0.01")
        })
      ).to.be.revertedWith("Message too long (max 500 chars)");
    });

    it("Should reject zero IDR amount", async function () {
      await expect(
        buyMeACoffee.connect(addr1).buyCoffeeInIdr("Alice", "Message", 0, {
          value: ethers.parseEther("0.01")
        })
      ).to.be.revertedWith("IDR amount must be greater than zero");
    });

    it("Should reject insufficient ETH sent", async function () {
      const requiredEth = await buyMeACoffee.idrToEth(50000);
      const insufficientEth = requiredEth / 2n; // Send only half

      await expect(
        buyMeACoffee.connect(addr1).buyCoffeeInIdr("Alice", "Message", 50000, {
          value: insufficientEth
        })
      ).to.be.revertedWith("Insufficient ETH sent");
    });

    it("Should allow empty message", async function () {
      const requiredEth = await buyMeACoffee.idrToEth(50000);

      await expect(
        buyMeACoffee.connect(addr1).buyCoffeeInIdr("Alice", "", 50000, {
          value: requiredEth
        })
      ).to.not.be.reverted;
    });
  });

  describe("Withdraw Tips", function () {
    beforeEach(async function () {
      // Add some funds to contract
      const requiredEth = await buyMeACoffee.idrToEth(50000);
      await buyMeACoffee
        .connect(addr1)
        .buyCoffeeInIdr("Alice", "Message", 50000, { value: requiredEth });
    });

    it("Should allow owner to withdraw tips", async function () {
      const contractBalance = await ethers.provider.getBalance(
        await buyMeACoffee.getAddress()
      );
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);

      const tx = await buyMeACoffee.withdrawTips();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;

      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);

      // Owner balance should increase by contractBalance minus gas
      const expectedIncrease = contractBalance - gasUsed;
      const actualIncrease = ownerBalanceAfter - ownerBalanceBefore;

      expect(actualIncrease).to.be.closeTo(expectedIncrease, expectedIncrease / 1000n);
    });

    it("Should emit TipsWithdrawn event", async function () {
      const contractBalance = await ethers.provider.getBalance(
        await buyMeACoffee.getAddress()
      );

      await expect(buyMeACoffee.withdrawTips())
        .to.emit(buyMeACoffee, "TipsWithdrawn")
        .withArgs(owner.address, contractBalance, await time.latest() + 1);
    });

    it("Should reject withdrawal from non-owner", async function () {
      await expect(
        buyMeACoffee.connect(addr1).withdrawTips()
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should reject withdrawal when balance is zero", async function () {
      // First withdraw all
      await buyMeACoffee.withdrawTips();

      // Try to withdraw again
      await expect(buyMeACoffee.withdrawTips()).to.be.revertedWith(
        "No funds to withdraw"
      );
    });

    it("Should leave contract with zero balance after withdrawal", async function () {
      await buyMeACoffee.withdrawTips();

      const balance = await ethers.provider.getBalance(
        await buyMeACoffee.getAddress()
      );
      expect(balance).to.equal(0);
    });
  });

  describe("Get Memos", function () {
    it("Should return empty array initially", async function () {
      const memos = await buyMeACoffee.getMemos();
      expect(memos.length).to.equal(0);
    });

    it("Should return all memos after purchases", async function () {
      const requiredEth = await buyMeACoffee.idrToEth(50000);

      await buyMeACoffee
        .connect(addr1)
        .buyCoffeeInIdr("Alice", "Message 1", 50000, { value: requiredEth });

      await buyMeACoffee
        .connect(addr2)
        .buyCoffeeInIdr("Bob", "Message 2", 50000, { value: requiredEth });

      const memos = await buyMeACoffee.getMemos();
      expect(memos.length).to.equal(2);
      expect(memos[0].name).to.equal("Alice");
      expect(memos[1].name).to.equal("Bob");
    });
  });

  describe("Helper Functions", function () {
    it("Should return correct memos count", async function () {
      expect(await buyMeACoffee.getMemosCount()).to.equal(0);

      const requiredEth = await buyMeACoffee.idrToEth(50000);
      await buyMeACoffee
        .connect(addr1)
        .buyCoffeeInIdr("Alice", "Message", 50000, { value: requiredEth });

      expect(await buyMeACoffee.getMemosCount()).to.equal(1);
    });

    it("Should return correct contract balance", async function () {
      const balanceBefore = await buyMeACoffee.getBalance();
      expect(balanceBefore).to.equal(0);

      const requiredEth = await buyMeACoffee.idrToEth(50000);
      await buyMeACoffee
        .connect(addr1)
        .buyCoffeeInIdr("Alice", "Message", 50000, { value: requiredEth });

      const balanceAfter = await buyMeACoffee.getBalance();
      expect(balanceAfter).to.equal(requiredEth);
    });
  });
});

// Helper for time manipulation
const time = {
  latest: async () => {
    const block = await ethers.provider.getBlock("latest");
    return block.timestamp;
  }
};
