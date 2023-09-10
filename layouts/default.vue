<template>
  <main class="text-center">
    <nav border-b p-6>
      <p text-4xl font-bold>Metaverse Marketplace</p>
      <div class="flex mt-4">
        <router-link to="/" mr-6 text-pink-500>Home</router-link>
        <router-link to="/create-nft" mr-6 text-pink-500>Sell NFT</router-link>
        <router-link to="/my-nfts" mr-6 text-pink-500>My NFTs</router-link>
        <router-link to="/dashboard" mr-6 text-pink-500>Dashboard</router-link>
        <DarkToggle ml-auto />
      </div>
    </nav>
    <slot />
  </main>
</template>
