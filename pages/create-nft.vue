<script setup lang="ts">
  import { ethers, parseUnits, BrowserProvider } from 'ethers';
  import { create as ipfsHttpClient } from 'ipfs-http-client';
  import Web3Modal from 'web3modal';
  import { marketplaceAddress } from '../web3/config';
  import NFTMarketplace from '../web3/artifacts/contracts/NFTMarketplace.sol/NFTMarketplace.json';

  const client = ipfsHttpClient({
    url: 'https://ipfs.infura.io:5001/api/v0',
    headers: {
      authorization: 'Basic ' + btoa('apiKey' + ':' + 'apiSecret'),
    },
  });
  const router = useRouter();
  const fileUrl = ref('');
  const form = reactive({ price: '', name: '', description: '' });

  async function onChange(e: Event) {
    /* upload image to IPFS */
    try {
      const file = (e.target as HTMLInputElement)?.files?.[0];

      if (!file) return;

      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      console.log('added file', added);
      const url = `https://ipfs.io/ipfs/${added.path}`;

      fileUrl.value = url;
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  }

  async function uploadToIPFS() {
    const { name, description, price } = form;
    if (!name || !description || !price || !fileUrl.value) return;
    /* first, upload metadata to IPFS */
    const data = JSON.stringify({ name, description, image: fileUrl.value });
    try {
      const added = await client.add(data);
      const url = `https://ipfs.io/ipfs/${added.path}`;
      /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
      return url;
    } catch (error) {
      console.log('Error uploading file: ', error);
    }
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS();
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new BrowserProvider(connection);
    const signer = await provider.getSigner();

    /* create the NFT */
    const price = parseUnits(form.price, 'ether');
    const contract = new ethers.Contract(
      marketplaceAddress,
      NFTMarketplace.abi,
      signer,
    );
    const listingPrice = (await contract.getListingPrice()).toString();
    const transaction = await contract.createToken(url, price, {
      value: listingPrice,
    });
    await transaction.wait();

    router.push('/');
  }
</script>

<template>
  <div class="flex justify-center">
    <div class="w-1/2 flex flex-col pb-12">
      <input
        placeholder="Asset Name"
        class="mt-8 border rounded p-4 color-warmGray"
        v-model="form.name"
      />
      <textarea
        placeholder="Asset Description"
        class="mt-2 border rounded p-4 color-neutral"
        v-model="form.description"
      />
      <input
        placeholder="Asset Price in Eth"
        class="mt-2 border rounded p-4 color-neutral"
        v-model="form.price"
      />
      <input type="file" name="Asset" class="my-4" @change="onChange" />
      <img v-if="fileUrl" class="rounded mt-4" width="350" :src="fileUrl" />

      <button
        @click="listNFTForSale"
        class="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg"
      >
        Create NFT
      </button>
    </div>
  </div>
</template>
