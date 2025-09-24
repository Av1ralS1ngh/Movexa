// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PolygonNFT is ERC721, Ownable {
    using Strings for uint256;
    
    uint256 public constant MAX_TOKENS = 1200;
    string public baseURI;
    mapping(uint256 => bool) private _mintedIds;
    uint256 public totalSupply;

    constructor() ERC721("AuraEyes", "EoA") Ownable(msg.sender) {
        baseURI = "https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/";
    }

    function mintNFT(uint256 tokenId) external onlyOwner {
        require(tokenId >= 1 && tokenId <= MAX_TOKENS, "Invalid ID");
        require(!_mintedIds[tokenId], "ID already minted");
        require(totalSupply < MAX_TOKENS, "Max supply reached");
        
        _safeMint(msg.sender, tokenId);
        _mintedIds[tokenId] = true;
        totalSupply++;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "ERC721Metadata: URI query for nonexistent token");
        return string(abi.encodePacked(baseURI, tokenId.toString(), ".json"));
    }

    function setBaseURI(string memory newBaseURI) external onlyOwner {
        baseURI = newBaseURI;
    }

    function isMinted(uint256 tokenId) public view returns (bool) {
        return _mintedIds[tokenId];
    }
}