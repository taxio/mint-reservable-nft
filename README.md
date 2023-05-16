# Mint Reservable NFT
Users typically shy away from NFTs whose sellout potential is uncertain.

This repository contains a sample NFT contract that allows users to reserve minting until certain conditions are met, with an option to cancel.

Steps:

1. Users invoke the reserveMint function with the required minting price.
1. If the goal is not reached, users can cancel the reservation and withdraw their funds.
1. Once the goal is met, users can execute the mint function, but cancellation is no longer an option.
1. The owner of the NFT contract can withdraw funds only after the goal has been met.
