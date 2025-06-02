// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28; // Pastikan versi ini cocok dengan hardhat.config.js Anda
import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol"; // Path impor yang sudah benar

contract BuyMeACoffee {
    event NewMemo(address from, uint256 timestamp, string name, string message);
    
    AggregatorV3Interface internal ethusdpriceFeed;
    uint256 public usdtoidrPrice; // Ini adalah rate USD ke IDR
    
    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    Memo[] memos;
    address payable owner;

    // Constructor sekarang menerima alamat Price Feed DAN nilai awal USD ke IDR
    constructor(address _priceFeed) {
        owner = payable(msg.sender);
        ethusdpriceFeed = AggregatorV3Interface(_priceFeed);
        usdtoidrPrice = 15000; // Inisialisasi dengan nilai default, misal 15000 IDR per USD
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    // Fungsi untuk memperbarui rate USD ke IDR oleh pemilik
    function updateusdtoidrprice(uint256 _rate) public onlyOwner {
        require(_rate > 0, "USD to IDR rate must be greater than zero");
        usdtoidrPrice = _rate;
    }

    // Mengambil harga ETH/USD terbaru dari Chainlink Oracle
    function getlatestethtousdprice() public view returns (uint256) {
        // Round data: (roundId, price, startedAt, updatedAt, answeredInRound)
        (, int price,,,) = ethusdpriceFeed.latestRoundData();
        // Pastikan harga yang diterima valid (tidak nol atau negatif)
        require(price > 0, "ETH to USD price from oracle is zero or invalid");
        return uint256(price);
    }

    // Mengkonversi jumlah IDR menjadi setara ETH (dalam Wei)
    function idrtoeth(uint256 idrAmount) public view returns (uint256) {
        uint256 ethPrice = getlatestethtousdprice(); // Harga ETH dalam USD (misal: 3000 * 1e8)
        
        // Pastikan usdtoidrPrice sudah disetel dan tidak nol
        require(usdtoidrPrice > 0, "USD to IDR price not set or is zero (call updateusdtoidrprice)");

        // Perhitungan:
        // 1. Konversi IDR ke USD: (idrAmount * 1e8) / usdtoidrPrice
        //    Asumsi: usdtoidrPrice disetel sebagai raw IDR (misal: 15000), 
        //    sedangkan idrAmount discale dengan 1e8 untuk konsistensi desimal dengan ethPrice
        //    Hasil usdAmount akan dalam format 8 desimal (seperti harga Chainlink)
        uint256 usdAmount = (idrAmount * 1e8) / usdtoidrPrice;
        
        // 2. Konversi USD ke ETH: (usdAmount * 1e18) / ethPrice
        //    ethPrice adalah harga ETH dalam USD (dengan 8 desimal).
        //    usdAmount juga dalam 8 desimal.
        //    Maka (usdAmount / 1e8) adalah USD aktual.
        //    ethAmount = (usdAmount / 1e8) * (1e18 / (ethPrice / 1e8)) = (usdAmount * 1e18) / ethPrice
        uint256 ethAmount = (usdAmount * 1e18) / ethPrice; // Convert to wei

        return ethAmount;
    }
    
    // Fungsi untuk membeli kopi dengan pembayaran dalam IDR (yang dikonversi ke ETH)
    function buycoffeeinidr(string memory name, string memory message, uint256 idrAmount) public payable{
        uint256 ethamount = idrtoeth(idrAmount); // Hitung ETH yang dibutuhkan
        require(msg.value >= ethamount, "Insufficient funds sent. Check IDR amount or exchange rate.");
        
        // Opsional: Jika msg.value > ethamount, kembalikan sisa ETH ke pengirim
        if (msg.value > ethamount) {
            payable(msg.sender).transfer(msg.value - ethamount);
        }

        memos.push(Memo(msg.sender, block.timestamp, name, message));
        emit NewMemo(msg.sender, block.timestamp, name, message);
    }

    function withdrawTips() public onlyOwner { // Hanya pemilik yang bisa withdraw
        require(address(this).balance > 0, "No funds to withdraw");
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Failed to withdraw Ether");
    }

    function getMemos() public view returns (Memo[] memory) {
        return memos;
    }
}