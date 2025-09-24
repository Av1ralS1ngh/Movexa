// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC721, Ownable {
    // Simple token counter
    uint256 private _tokenIdCounter;

    // Mapping for token URIs
    mapping(uint256 => string) private _tokenURIs;

    constructor() ERC721("SoulBoundEyes", "SoA") Ownable(msg.sender) {}

    // Override tokenURI to return our stored URI.
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    // Override transfer functions to prevent transfers, making tokens soulbound.

    // This overrides the non-virtual transferFrom if it was virtual, but it's safe to do so here:
    function transferFrom(
        address,
        address,
        uint256
    ) public pure override {
        revert("MyToken: Tokens are soulbound and non-transferable");
    }

    // Override the virtual safeTransferFrom with the bytes parameter.
    function safeTransferFrom(
        address,
        address,
        uint256,
        bytes memory
    ) public pure override {
        revert("MyToken: Tokens are soulbound and non-transferable");
    }

    // Note: Calls to safeTransferFrom(address, address, uint256) will forward to our above override,
    // ensuring that all safe transfer attempts are reverted.

    // Mint functions (onlyOwner) for each NFT with its specific metadata

    function mintNFT1(address to) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _tokenURIs[tokenId] = "https://gateway.lighthouse.storage/ipfs/bafybeibokqpidn3gvdnvp7zwgi7aqebxfg6qwyr4ze4m6jqjraaeq6rcoe/1.json";
        _mint(to, tokenId);
    }

    function mintNFT2(address to) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _tokenURIs[tokenId] = "https://gateway.lighthouse.storage/ipfs/bafybeibokqpidn3gvdnvp7zwgi7aqebxfg6qwyr4ze4m6jqjraaeq6rcoe/2.json";
        _mint(to, tokenId);
    }

    function mintNFT3(address to) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _tokenURIs[tokenId] = "https://gateway.lighthouse.storage/ipfs/bafybeibokqpidn3gvdnvp7zwgi7aqebxfg6qwyr4ze4m6jqjraaeq6rcoe/3.json";
        _mint(to, tokenId);
    }

    function mintNFT4(address to) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _tokenURIs[tokenId] = "https://gateway.lighthouse.storage/ipfs/bafybeibokqpidn3gvdnvp7zwgi7aqebxfg6qwyr4ze4m6jqjraaeq6rcoe/4.json";
        _mint(to, tokenId);
    }

    function mintNFT5(address to) external onlyOwner {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;
        _tokenURIs[tokenId] = "https://gateway.lighthouse.storage/ipfs/bafybeibokqpidn3gvdnvp7zwgi7aqebxfg6qwyr4ze4m6jqjraaeq6rcoe/5.json";
        _mint(to, tokenId);
    }
}