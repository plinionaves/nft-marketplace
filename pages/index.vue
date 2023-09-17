<script setup lang="ts">
  import {
    ethers,
    formatUnits,
    parseUnits,
    JsonRpcProvider,
    BrowserProvider,
  } from 'ethers';
  import axios from 'axios';
  import Web3Modal from 'web3modal';
  import { marketplaceAddress } from '../web3/config';
  import NFTMarketplace from '../web3/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';

  interface MarketItem {
    price: string;
    tokenId: number;
    seller: string;
    owner: string;
    image: string;
    name: string;
    description: string;
  }

  const router = useRouter();
  const nfts = ref<MarketItem[]>([]);
  const loading = ref(true);

  async function loadNFTs() {
    /* create a generic provider and query for unsold market items */
    const provider = new JsonRpcProvider('https://rpc-mumbai.maticvigil.com');
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      provider,
    );
    const data = await contract.fetchMarketItems();

    /*
     *  map over items returned from smart contract and format
     *  them as well as fetch their token metadata
     */
    const items = await Promise.all<MarketItem[]>(
      data.map(async (i: any) => {
        const tokenUri = await contract.tokenURI(i.tokenId);
        const meta = await axios.get(tokenUri);
        const price = formatUnits(i.price.toString(), 'ether');

        return {
          price,
          tokenId: i.tokenId.toString(),
          seller: i.seller,
          owner: i.owner,
          image: meta.data.image,
          name: meta.data.name,
          description: meta.data.description,
        };
      }),
    );

    nfts.value = items;
    loading.value = false;
  }

  async function buyNft(nft: any) {
    /* needs the user to sign the transaction, so will use Web3Provider and sign it */
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new BrowserProvider(connection);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer,
    );

    /* user will be prompted to pay the asking proces to complete the transaction */
    const price = parseUnits(nft.price.toString(), 'ether');
    const transaction = await contract.createMarketSale(nft.tokenId, {
      value: price,
    });
    await transaction.wait();
    loadNFTs();
  }

  function listNFT(nft: any) {
    router.push(`/resell-nft?id=${nft.tokenId}&tokenURI=${nft.tokenURI}`);
  }

  loadNFTs();
</script>

<template>
  <ClientOnly>
    <h1 v-if="loading" py-10 px-20 text-1xl>Loading...</h1>

    <h1 v-else-if="!nfts.length" py-10 px-20 text-1xl>
      No items in marketplace
    </h1>

    <div v-else class="flex justify-center">
      <div class="px-4" :style="{ maxWidth: '1600px' }">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          <div
            v-for="(nft, i) in nfts"
            :key="i"
            class="flex flex-col border shadow rounded-xl overflow-hidden"
          >
            <img :src="nft.image" />
            <div class="mt-auto p-4">
              <p :style="{ height: '64px' }" class="text-2xl font-semibold">
                {{ nft.name }}
              </p>
              <div :style="{ height: '70px', overflow: 'hidden' }">
                <p class="text-gray-400">{{ nft.description }}</p>
              </div>
            </div>
            <div class="p-4 bg-black">
              <p class="text-2xl font-bold text-white">{{ nft.price }} MATIC</p>
              <button
                class="mt-4 w-full bg-pink-500 text-white font-bold py-2 px-12 rounded"
                @click="buyNft(nft)"
              >
                Buy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ClientOnly>
</template>
