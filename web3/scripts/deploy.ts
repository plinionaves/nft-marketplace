import { ethers } from 'hardhat';
import fs from 'fs';
import path from 'path';

async function main() {
  const NFTMarketplace = await ethers.getContractFactory('NFTMarketplace');
  const nftMarketplace = await NFTMarketplace.deploy();

  await nftMarketplace.waitForDeployment();

  const address = await nftMarketplace.getAddress();
  console.log('nftMarketplace deployed to:', address);
  fs.writeFileSync(
    path.join(__dirname, '..', 'config.ts'),
    `
  export const marketplaceAddress = "${address}"
  `,
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
