<script setup lang="ts">
  import { BrowserProvider, ethers, formatUnits } from 'ethers';
  import axios from 'axios';
  import Web3Modal from 'web3modal';
  import { marketplaceAddress } from '../web3/config';
  import NFTMarketplace from '../web3/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';

  const nfts = ref<any[]>([]);
  const loading = ref(true);

  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    });
    const connection = await web3Modal.connect();
    const provider = new BrowserProvider(connection);
    const signer = await provider.getSigner();

    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer,
    );
    const data = await contract.fetchItemsListed();

    const items = await Promise.all(
      data.map(async (i: any) => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        let price = formatUnits(i.price.toString(), 'ether');
        let item = {
          price,
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
        };
        return item;
      }),
    );

    nfts.value = items;
    loading.value = false;
  }

  loadNFTs();
</script>

<template>
  <h1 v-if="loading" py-10 px-20 text-1xl>Loading...</h1>

  <h1 v-else-if="!nfts.length" py-10 px-20 text-1xl>No NFTs listed</h1>

  <div v-else class="p-4">
    <h2 class="text-2xl py-2">Items Listed</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
      <div
        v-for="(nft, i) in nfts"
        :key="i"
        class="flex flex-col border shadow rounded-xl overflow-hidden"
      >
        <img :src="nft.image" class="rounded" />
        <div class="mt-auto p-4 bg-black">
          <p class="text-2xl font-bold text-white">
            Price - {{ nft.price }} MATIC
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
