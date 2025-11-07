// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title BuyMeACoffee
 * @dev A decentralized "Buy Me a Coffee" platform with dynamic IDR to ETH conversion
 * @notice This contract allows users to send coffee donations in IDR (converted to ETH) with messages
 */
contract BuyMeACoffee is ReentrancyGuard {

    // ============ Events ============

    /// @notice Emitted when a new coffee is purchased
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    /// @notice Emitted when USD to IDR rate is updated
    event UsdToIdrRateUpdated(
        uint256 oldRate,
        uint256 newRate,
        address indexed updatedBy
    );

    /// @notice Emitted when owner withdraws funds
    event TipsWithdrawn(
        address indexed to,
        uint256 amount,
        uint256 timestamp
    );

    // ============ State Variables ============

    /// @notice Chainlink ETH/USD price feed
    AggregatorV3Interface internal ethUsdPriceFeed;

    /// @notice USD to IDR exchange rate (e.g., 15000 IDR per USD)
    uint256 public usdToIdrPrice;

    /// @notice Contract owner address
    address payable public owner;

    // ============ Constants ============

    /// @notice Maximum length for name field (prevent gas attacks)
    uint256 public constant MAX_NAME_LENGTH = 100;

    /// @notice Maximum length for message field (prevent gas attacks)
    uint256 public constant MAX_MESSAGE_LENGTH = 500;

    /// @notice Minimum USD to IDR rate (sanity check)
    uint256 public constant MIN_USD_TO_IDR_RATE = 1000;

    /// @notice Maximum USD to IDR rate (sanity check)
    uint256 public constant MAX_USD_TO_IDR_RATE = 100000;

    // ============ Structs ============

    /// @notice Structure for storing coffee memo data
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    /// @notice Array of all memos
    Memo[] public memos;

    // ============ Modifiers ============

    /// @notice Restricts function access to owner only
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // ============ Constructor ============

    /**
     * @notice Initialize the contract with Chainlink price feed
     * @param _priceFeed Address of Chainlink ETH/USD price feed on Sepolia
     */
    constructor(address _priceFeed) {
        require(_priceFeed != address(0), "Invalid price feed address");
        owner = payable(msg.sender);
        ethUsdPriceFeed = AggregatorV3Interface(_priceFeed);
        usdToIdrPrice = 15000; // Initialize with default rate (15,000 IDR per USD)
    }

    // ============ Admin Functions ============

    /**
     * @notice Update USD to IDR exchange rate (Owner only)
     * @param _rate New USD to IDR rate
     */
    function updateUsdToIdrPrice(uint256 _rate) external onlyOwner {
        require(_rate >= MIN_USD_TO_IDR_RATE && _rate <= MAX_USD_TO_IDR_RATE,
            "Rate must be between 1000 and 100000");

        uint256 oldRate = usdToIdrPrice;
        usdToIdrPrice = _rate;

        emit UsdToIdrRateUpdated(oldRate, _rate, msg.sender);
    }

    /**
     * @notice Withdraw all accumulated tips (Owner only)
     * @dev Protected against reentrancy attacks with nonReentrant modifier
     */
    function withdrawTips() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");

        // Using call instead of transfer for better gas handling
        (bool success, ) = owner.call{value: balance}("");
        require(success, "Failed to withdraw Ether");

        emit TipsWithdrawn(owner, balance, block.timestamp);
    }

    // ============ Public Functions ============

    /**
     * @notice Get latest ETH/USD price from Chainlink oracle
     * @return Latest ETH price in USD (8 decimals)
     */
    function getLatestEthToUsdPrice() public view returns (uint256) {
        (, int price, , , ) = ethUsdPriceFeed.latestRoundData();
        require(price > 0, "Invalid ETH/USD price from oracle");
        return uint256(price);
    }

    /**
     * @notice Convert IDR amount to equivalent ETH (in Wei)
     * @param idrAmount Amount in IDR to convert
     * @return Equivalent amount in Wei
     */
    function idrToEth(uint256 idrAmount) public view returns (uint256) {
        require(idrAmount > 0, "IDR amount must be greater than zero");

        uint256 ethPrice = getLatestEthToUsdPrice(); // ETH price in USD (8 decimals)
        require(usdToIdrPrice > 0, "USD to IDR rate not set");

        // Conversion calculation:
        // 1. Convert IDR to USD: (idrAmount * 1e8) / usdToIdrPrice
        // 2. Convert USD to ETH: (usdAmount * 1e18) / ethPrice
        // Combined: (idrAmount * 1e8 * 1e18) / (usdToIdrPrice * ethPrice)

        uint256 usdAmount = (idrAmount * 1e8) / usdToIdrPrice;
        uint256 ethAmount = (usdAmount * 1e18) / ethPrice;

        return ethAmount;
    }

    /**
     * @notice Buy a coffee by sending a donation in IDR (converted to ETH)
     * @param name Name of the sender (max 100 chars)
     * @param message Message from the sender (max 500 chars)
     * @param idrAmount Amount in IDR to donate
     */
    function buyCoffeeInIdr(
        string memory name,
        string memory message,
        uint256 idrAmount
    ) external payable {
        // Input validation
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(name).length <= MAX_NAME_LENGTH, "Name too long (max 100 chars)");
        require(bytes(message).length <= MAX_MESSAGE_LENGTH, "Message too long (max 500 chars)");
        require(idrAmount > 0, "IDR amount must be greater than zero");

        // Calculate required ETH
        uint256 requiredEth = idrToEth(idrAmount);
        require(msg.value >= requiredEth, "Insufficient ETH sent");

        // Refund excess ETH if any
        if (msg.value > requiredEth) {
            uint256 refund = msg.value - requiredEth;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Failed to refund excess ETH");
        }

        // Store memo
        memos.push(Memo({
            from: msg.sender,
            timestamp: block.timestamp,
            name: name,
            message: message
        }));

        // Emit event
        emit NewMemo(msg.sender, block.timestamp, name, message);
    }

    /**
     * @notice Get all memos
     * @return Array of all coffee memos
     */
    function getMemos() external view returns (Memo[] memory) {
        return memos;
    }

    /**
     * @notice Get total number of memos
     * @return Total count of memos
     */
    function getMemosCount() external view returns (uint256) {
        return memos.length;
    }

    /**
     * @notice Get contract balance
     * @return Current balance in Wei
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
