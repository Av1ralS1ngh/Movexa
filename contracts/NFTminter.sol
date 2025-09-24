// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract NFT is ERC721, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_TOKENS = 1200;
    uint256 public totalSupply;
    string public baseUri;
    string public baseExtension = ".json";
    
    mapping(uint256 => uint256) private _metadataToTokenId;
    mapping(uint256 => uint256) private _tokenMetadata;
    mapping(uint256 => uint256) private _availableTokens;
    uint256 private _numAvailable = MAX_TOKENS;
    mapping(address => uint256) private mintedPerWallet;

    constructor() ERC721("AuraEyes", "EoA") Ownable(msg.sender) {
        baseUri = "https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/";
    }

    // Add this burn function
function burn(uint256 tokenId) external {
    address owner = ownerOf(tokenId);
    require(
        msg.sender == owner || 
        isApprovedForAll(owner, msg.sender) || 
        getApproved(tokenId) == msg.sender,
        "Not authorized"
    );
    
    uint256 metadataId = _tokenMetadata[tokenId];
    
    // Add metadata back to available tokens
    _availableTokens[_numAvailable] = metadataId;
    _numAvailable++;
    
    // Clean up metadata tracking
    delete _metadataToTokenId[metadataId];
    delete _tokenMetadata[tokenId];
    
    // Update total supply
    totalSupply--;
    
    // Perform actual burn
    _burn(tokenId);
}

    // Rest of the contract remains unchanged
    function mint(uint256 _numTokens) external {
        uint256 curTotalSupply = totalSupply;
        require(curTotalSupply + _numTokens <= MAX_TOKENS, "Exceeds total supply");

        for (uint256 i = 0; i < _numTokens; i++) {
            uint256 newTokenId = curTotalSupply + i + 1;
            uint256 randNonce = uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, newTokenId, i))
            );
            uint256 randomIndex = randNonce % _numAvailable;

            uint256 metadataId = _availableTokens[randomIndex];
            if (metadataId == 0) metadataId = randomIndex + 1;

            require(_metadataToTokenId[metadataId] == 0, "Metadata ID already used");

            uint256 lastIndex = _numAvailable - 1;
            uint256 lastVal = _availableTokens[lastIndex];
            _availableTokens[randomIndex] = lastVal == 0 ? lastIndex + 1 : lastVal;
            _numAvailable--;

            _tokenMetadata[newTokenId] = metadataId;
            _metadataToTokenId[metadataId] = newTokenId;
            _safeMint(msg.sender, newTokenId);
        }
        mintedPerWallet[msg.sender] += _numTokens;
        totalSupply += _numTokens;
    }

    function mintNFTfromID(uint256 metadataId) external {
        require(metadataId >= 1 && metadataId <= MAX_TOKENS, "Invalid ID");
        require(_metadataToTokenId[metadataId] == 0, "Metadata ID already used");
        require(totalSupply + 1 <= MAX_TOKENS, "Max supply reached");
        
        bool found;
        for (uint256 i = 0; i < _numAvailable; i++) {
            uint256 currentId = _availableTokens[i] == 0 ? i + 1 : _availableTokens[i];
            if (currentId == metadataId) {
                uint256 lastVal = _availableTokens[_numAvailable - 1];
                _availableTokens[i] = lastVal == 0 ? _numAvailable : lastVal;
                found = true;
                break;
            }
        }
        require(found, "ID not available");

        _numAvailable--;
        uint256 newTokenId = totalSupply + 1;
        
        _tokenMetadata[newTokenId] = metadataId;
        _metadataToTokenId[metadataId] = newTokenId;
        _safeMint(msg.sender, newTokenId);
        
        totalSupply++;
        mintedPerWallet[msg.sender]++;
    }

    function withdrawAll() external payable onlyOwner {
        uint256 balance = address(this).balance;
        (bool transfer, ) = payable(msg.sender).call{value: balance}("");
        require(transfer, "Transfer failed");
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(_ownerOf(tokenId) != address(0), "Nonexistent token");
        return string(abi.encodePacked(baseUri, _tokenMetadata[tokenId].toString(), baseExtension));
    }
}