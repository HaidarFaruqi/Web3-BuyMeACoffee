// src/types/global.d.ts

// Mendefinisikan ulang interface Window untuk menyertakan properti 'ethereum'
interface Window {
  // Properti 'ethereum' bersifat opsional (?) dan tipenya adalah Eip1193Provider dari ethers.js.
  // Eip1193Provider adalah tipe standar untuk provider Web3 yang diinject.
  // Jika Anda tidak ingin mengimpor Eip1193Provider, Anda bisa menggunakan 'any' sebagai fallback
  // ethereum?: any;
  ethereum?: import('ethers').Eip1193Provider; 
}