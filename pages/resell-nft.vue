<script setup lang="ts">
  import { BrowserProvider, ethers, parseUnits } from 'ethers';
  import axios from 'axios';
  import Web3Modal from 'web3modal';
  import { marketplaceAddress } from '../web3/config';
  import NFTMarketplace from '../web3/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';

  const form = reactive({ price: '', image: '' });
  const image = ref('');
  const router = useRouter();
  const route = useRoute();
  const { id, tokenURI } = route.query;

  async function listNFTForSale() {
    if (!form.price) return;
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new BrowserProvider(connection);
    const signer = await provider.getSigner();

    const priceFormatted = parseUnits(form.price, 'ether');
    let contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer,
    );
    let listingPrice = await contract.getListingPrice();

    listingPrice = listingPrice.toString();
    let transaction = await contract.resellToken(id, priceFormatted, {
      value: listingPrice,
    });
    await transaction.wait();

    router.push('/');
  }

  async function fetchNFT() {
    if (!tokenURI) return;
    const meta = await axios.get(tokenURI.toString());
    form.image = meta.data.image;
  }

  fetchNFT();
</script>

<template>
  <div class="flex justify-center">
    <div class="w-1/2 flex flex-col pb-12">
      <input
        placeholder="Asset Price in Eth"
        class="mt-2 border rounded p-4 color-neutral"
        v-model="form.price"
      />
      <img v-if="image" class="rounded mt-4" width="350" :src="image" />
      <button
        @click="listNFTForSale"
        class="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
      >
        List NFT
      </button>
    </div>
  </div>
</template>
