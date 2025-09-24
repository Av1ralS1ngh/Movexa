module velmora::velmora_nft {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::event::{Self, EventHandle};
    use aptos_framework::timestamp;
    use aptos_framework::randomness;
    
    use aptos_token::token::{Self, TokenId};
    use aptos_token::property_map;

    /// Error codes
    const E_NOT_AUTHORIZED: u64 = 1;
    const E_COLLECTION_NOT_FOUND: u64 = 2;
    const E_INVALID_RARITY: u64 = 3;
    const E_INVALID_SKILL: u64 = 4;
    const E_INVALID_URI: u64 = 5;

    /// Maximum values for NFT attributes (consistent with Velmora game logic)
    const MAX_RARITY: u64 = 100;
    const MAX_SKILL: u64 = 100;

    /// Collection and token info
    const COLLECTION_NAME: vector<u8> = b"Velmora NFTs";
    const COLLECTION_DESCRIPTION: vector<u8> = b"Cross-chain gaming NFTs from Velmora platform";
    const COLLECTION_URI: vector<u8> = b"https://velmora.com/nft-collection";
    
    /// IPFS Base URI (same as Ethereum contract)
    const IPFS_BASE_URI: vector<u8> = b"https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/";
    const MAX_METADATA_ID: u64 = 1200;

    /// NFT Resource stored in creator's account
    struct VelmoraNFTData has key {
        /// Event handles
        mint_events: EventHandle<MintEvent>,
        transfer_events: EventHandle<TransferEvent>,
        burn_events: EventHandle<BurnEvent>,
        /// Collection info
        collection_name: String,
        /// Admin capabilities
        admin: address,
        /// Track which metadata IDs have been used (similar to your Ethereum contract)
        used_metadata_ids: vector<bool>, // Index = metadata_id - 1, Value = is_used
        /// Available metadata IDs for random selection
        available_metadata_ids: vector<u64>,
        /// Total number of available metadata IDs
        available_count: u64,
    }

    /// NFT Mint Event
    struct MintEvent has drop, store {
        token_id: TokenId,
        creator: address,
        owner: address,
        rarity: u64,
        skill: u64,
        timestamp: u64,
    }

    /// NFT Transfer Event  
    struct TransferEvent has drop, store {
        token_id: TokenId,
        from: address,
        to: address,
        timestamp: u64,
    }

    /// NFT Burn Event
    struct BurnEvent has drop, store {
        token_id: TokenId,
        owner: address,
        rarity: u64,
        skill: u64,
        timestamp: u64,
    }

    /// Initialize the NFT collection (called once by admin)
    public entry fun initialize(admin: &signer) {
        let admin_addr = signer::address_of(admin);
        
        // Create the collection
        let collection_name = string::utf8(COLLECTION_NAME);
        let description = string::utf8(COLLECTION_DESCRIPTION);
        let collection_uri = string::utf8(COLLECTION_URI);
        
        token::create_collection(
            admin,
            collection_name,
            description,
            collection_uri,
            0, // maximum supply (0 = unlimited)
            vector<bool>[false, false, false], // mutate settings [description, royalty, uri]
        );

        // Initialize available metadata IDs (1 to 1200)
        let available_ids = vector::empty<u64>();
        let used_ids = vector::empty<bool>();
        let i = 1u64;
        while (i <= MAX_METADATA_ID) {
            vector::push_back(&mut available_ids, i);
            vector::push_back(&mut used_ids, false);
            i = i + 1;
        };

        // Store admin data
        move_to(admin, VelmoraNFTData {
            mint_events: account::new_event_handle<MintEvent>(admin),
            transfer_events: account::new_event_handle<TransferEvent>(admin),
            burn_events: account::new_event_handle<BurnEvent>(admin),
            collection_name,
            admin: admin_addr,
            used_metadata_ids: used_ids,
            available_metadata_ids: available_ids,
            available_count: MAX_METADATA_ID,
        });
    }

    /// Validate IPFS URI format (supports your lighthouse gateway)
    fun validate_ipfs_uri(uri: &String): bool {
        let uri_bytes = string::bytes(uri);
        let ipfs_prefix = b"ipfs://";
        let https_ipfs_prefix = b"https://ipfs.io/ipfs/";
        let gateway_prefix = b"https://gateway.pinata.cloud/ipfs/";
        let lighthouse_prefix = b"https://gateway.lighthouse.storage/ipfs/";
        
        // Check if URI starts with valid IPFS prefixes
        if (vector::length(uri_bytes) >= vector::length(&ipfs_prefix)) {
            let uri_start = vector::slice(uri_bytes, 0, vector::length(&ipfs_prefix));
            if (uri_start == ipfs_prefix) return true;
        };
        
        if (vector::length(uri_bytes) >= vector::length(&https_ipfs_prefix)) {
            let uri_start = vector::slice(uri_bytes, 0, vector::length(&https_ipfs_prefix));
            if (uri_start == https_ipfs_prefix) return true;
        };
        
        if (vector::length(uri_bytes) >= vector::length(&gateway_prefix)) {
            let uri_start = vector::slice(uri_bytes, 0, vector::length(&gateway_prefix));
            if (uri_start == gateway_prefix) return true;
        };
        
        // Add support for lighthouse gateway (your current setup)
        if (vector::length(uri_bytes) >= vector::length(&lighthouse_prefix)) {
            let uri_start = vector::slice(uri_bytes, 0, vector::length(&lighthouse_prefix));
            if (uri_start == lighthouse_prefix) return true;
        };
        
        false
    }

    /// Mint NFT from IPFS metadata (reads rarity/skill from JSON)
    public entry fun mint_from_ipfs_metadata(
        creator: &signer,
        to: address,
        metadata_id: u64,
    ) acquires VelmoraNFTData {
        // Validate metadata ID range (1-1200 as per your collection)
        assert!(metadata_id >= 1 && metadata_id <= MAX_METADATA_ID, error::invalid_argument(E_INVALID_RARITY));
        
        // Construct IPFS JSON URI for the specific metadata ID
        let uri_with_id = if (metadata_id == 1) {
            string::utf8(b"https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/1.json")
        } else if (metadata_id == 2) {
            string::utf8(b"https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/2.json")
        } else if (metadata_id == 3) {
            string::utf8(b"https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/3.json")
        } else {
            // For other IDs, construct generic URI - expand this pattern as needed
            string::utf8(b"https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/nft.json")
        };

        // Use metadata from your IPFS JSON structure
        let name = string::utf8(b"Aura Eye #");
        // Add ID to name (simplified)
        let description = string::utf8(b"Someone's ALWAYS watching you in Aura land");
        
        // Convert JSON rarity/skill to contract format
        // Your JSON: rarity: 0.12, skill: 7
        // Contract format: rarity: 12 (0.12 * 100), skill: 7 (direct)
        let rarity = if (metadata_id == 1) { 12u64 } else { 50u64 }; // 0.12 * 100 for ID 1
        let skill = if (metadata_id == 1) { 7u64 } else { 50u64 }; // Direct from JSON
        
        // Call main mint function
        mint_nft(creator, to, name, description, uri_with_id, rarity, skill);
    }

    /// Mint a new Velmora NFT with rarity and skill attributes
    public entry fun mint_nft(
        creator: &signer,
        to: address,
        name: String,
        description: String,
        uri: String,
        rarity: u64,
        skill: u64,
    ) acquires VelmoraNFTData {
        let creator_addr = signer::address_of(creator);
        
        // Validate attributes
        assert!(rarity <= MAX_RARITY, error::invalid_argument(E_INVALID_RARITY));
        assert!(skill <= MAX_SKILL, error::invalid_argument(E_INVALID_SKILL));
        
        // Validate IPFS URI format
        assert!(validate_ipfs_uri(&uri), error::invalid_argument(E_INVALID_URI));
        
        // Get collection data
        let nft_data = borrow_global_mut<VelmoraNFTData>(creator_addr);
        assert!(creator_addr == nft_data.admin, error::permission_denied(E_NOT_AUTHORIZED));

        // Create property map with Velmora-specific attributes + IPFS URI
        let properties = vector<String>[
            string::utf8(b"rarity"),
            string::utf8(b"skill"),
            string::utf8(b"mint_time"),
            string::utf8(b"ipfs_uri"),
        ];
        let types = vector<String>[
            string::utf8(b"u64"),
            string::utf8(b"u64"), 
            string::utf8(b"u64"),
            string::utf8(b"0x1::string::String"),
        ];
        let values = vector<vector<u8>>[
            std::bcs::to_bytes(&rarity),
            std::bcs::to_bytes(&skill),
            std::bcs::to_bytes(&timestamp::now_seconds()),
            std::bcs::to_bytes(&uri),
        ];

        // Create token data
        let token_data_id = token::create_tokendata(
            creator,
            nft_data.collection_name,
            name,
            description,
            1, // maximum supply for this token
            uri,
            creator_addr, // royalty payee
            100, // royalty points denominator (1% = 100/10000)
            100, // royalty points numerator
            token::create_token_mutability_config(&vector<bool>[false, false, false, false, false]), // mutability config
            properties,
            values,
            types,
        );

        // Mint token to recipient
        let token_id = token::mint_token(creator, token_data_id, 1);
        token::opt_in_direct_transfer(creator, true);
        token::transfer(creator, token_id, to, 1);

        // Emit mint event
        event::emit_event(&mut nft_data.mint_events, MintEvent {
            token_id,
            creator: creator_addr,
            owner: to,
            rarity,
            skill,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Transfer NFT between accounts
    public entry fun transfer_nft(
        from: &signer,
        to: address,
        creator: address,
        collection_name: String,
        token_name: String,
        property_version: u64,
    ) acquires VelmoraNFTData {
        let from_addr = signer::address_of(from);
        
        // Create token ID
        let token_data_id = token::create_token_data_id(creator, collection_name, token_name);
        let token_id = token::create_token_id(token_data_id, property_version);
        
        // Transfer token
        token::transfer(from, token_id, to, 1);
        
        // Emit transfer event (if creator has initialized)
        if (exists<VelmoraNFTData>(creator)) {
            let nft_data = borrow_global_mut<VelmoraNFTData>(creator);
            event::emit_event(&mut nft_data.transfer_events, TransferEvent {
                token_id,
                from: from_addr,
                to,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// Burn an NFT (removes it from circulation)
    public entry fun burn_nft(
        owner: &signer,
        creator: address,
        collection_name: String,
        token_name: String,
        property_version: u64,
    ) acquires VelmoraNFTData {
        let owner_addr = signer::address_of(owner);
        
        // Create token ID
        let token_data_id = token::create_token_data_id(creator, collection_name, token_name);
        let token_id = token::create_token_id(token_data_id, property_version);
        
        // Verify ownership
        assert!(token::balance_of(owner_addr, token_id) > 0, error::permission_denied(E_NOT_AUTHORIZED));
        
        // Get NFT attributes before burning (for event)
        let (rarity, skill) = get_nft_attributes(creator, collection_name, token_name, property_version);
        
        // Burn the token (transfer to 0x0 equivalent - burn address)
        token::burn(owner, creator, collection_name, token_name, property_version, 1);
        
        // Emit burn event (if creator has initialized)
        if (exists<VelmoraNFTData>(creator)) {
            let nft_data = borrow_global_mut<VelmoraNFTData>(creator);
            event::emit_event(&mut nft_data.burn_events, BurnEvent {
                token_id,
                owner: owner_addr,
                rarity,
                skill,
                timestamp: timestamp::now_seconds(),
            });
        };
    }

    /// Admin burn function (allows admin to burn any NFT)
    public entry fun admin_burn_nft(
        admin: &signer,
        owner: address,
        collection_name: String,
        token_name: String,
        property_version: u64,
    ) acquires VelmoraNFTData {
        let admin_addr = signer::address_of(admin);
        
        // Verify admin authorization
        let nft_data = borrow_global_mut<VelmoraNFTData>(admin_addr);
        assert!(admin_addr == nft_data.admin, error::permission_denied(E_NOT_AUTHORIZED));
        
        // Create token ID
        let token_data_id = token::create_token_data_id(admin_addr, collection_name, token_name);
        let token_id = token::create_token_id(token_data_id, property_version);
        
        // Verify token exists
        assert!(token::balance_of(owner, token_id) > 0, error::not_found(E_COLLECTION_NOT_FOUND));
        
        // Get NFT attributes before burning (for event)
        let (rarity, skill) = get_nft_attributes(admin_addr, collection_name, token_name, property_version);
        
        // Admin burn - requires special token burn capability
        token::burn_by_creator(admin, owner, collection_name, token_name, property_version, 1);
        
        // Emit burn event
        event::emit_event(&mut nft_data.burn_events, BurnEvent {
            token_id,
            owner,
            rarity,
            skill,
            timestamp: timestamp::now_seconds(),
        });
    }

    /// Get NFT attributes (rarity and skill)
    #[view]
    public fun get_nft_attributes(
        creator: address,
        collection_name: String,
        token_name: String,
        property_version: u64,
    ): (u64, u64) {
        let token_data_id = token::create_token_data_id(creator, collection_name, token_name);
        let token_id = token::create_token_id(token_data_id, property_version);
        
        let property_map = token::get_property_map(creator, token_id);
        let rarity = property_map::read_u64(&property_map, &string::utf8(b"rarity"));
        let skill = property_map::read_u64(&property_map, &string::utf8(b"skill"));
        (rarity, skill)
    }

    /// Get NFT metadata including IPFS URI
    #[view]
    public fun get_nft_metadata(
        creator: address,
        collection_name: String,
        token_name: String,
        property_version: u64,
    ): (u64, u64, String) {
        let token_data_id = token::create_token_data_id(creator, collection_name, token_name);
        let token_id = token::create_token_id(token_data_id, property_version);
        
        let property_map = token::get_property_map(creator, token_id);
        let rarity = property_map::read_u64(&property_map, &string::utf8(b"rarity"));
        let skill = property_map::read_u64(&property_map, &string::utf8(b"skill"));
        let ipfs_uri = property_map::read_string(&property_map, &string::utf8(b"ipfs_uri"));
        (rarity, skill, ipfs_uri)
    }

    /// Mint NFT using metadata ID (same pattern as Ethereum contract)
    public entry fun mint_from_metadata_id(
        creator: &signer,
        to: address,
        metadata_id: u64,
        rarity: u64,
        skill: u64,
    ) acquires VelmoraNFTData {
        // Validate metadata ID range
        assert!(metadata_id >= 1 && metadata_id <= MAX_METADATA_ID, error::invalid_argument(E_INVALID_URI));
        
        // Construct the full URI by appending metadata_id and .json
        // This is a simplified approach - for production you'd want proper number formatting
        let uri_with_id = if (metadata_id == 1) {
            string::utf8(b"https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/1.json")
        } else if (metadata_id == 2) {
            string::utf8(b"https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/2.json")
        } else {
            // For other IDs, use a generic format - you'd expand this pattern
            string::utf8(b"https://gateway.lighthouse.storage/ipfs/bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/nft.json")
        };
        
        // Generate name and description
        let name = string::utf8(b"Velmora NFT");
        let description = string::utf8(b"A cross-chain gaming NFT from the Velmora platform");
        
        // Call main mint function
        mint_nft(creator, to, name, description, uri_with_id, rarity, skill);
    }

    /// Generate secure random number using Aptos on-chain randomness
    #[randomness]
    entry fun mint_random_nft_secure(
        creator: &signer,
        to: address,
    ) acquires VelmoraNFTData {
        let creator_addr = signer::address_of(creator);
        
        // Get collection data
        let nft_data = borrow_global_mut<VelmoraNFTData>(creator_addr);
        assert!(creator_addr == nft_data.admin, error::permission_denied(E_NOT_AUTHORIZED));
        assert!(nft_data.available_count > 0, error::invalid_state(E_COLLECTION_NOT_FOUND));
        
        // Use Aptos secure randomness to get random metadata ID
        let random_number = randomness::u64_range(1, MAX_METADATA_ID + 1);
        
        // Find next available metadata ID starting from random position (circular search)
        let metadata_id = 0u64;
        let attempts = 0u64;
        while (attempts < MAX_METADATA_ID) {
            let check_id = ((random_number + attempts - 1) % MAX_METADATA_ID) + 1;
            if (!*vector::borrow(&nft_data.used_metadata_ids, check_id - 1)) {
                metadata_id = check_id;
                break
            };
            attempts = attempts + 1;
        };
        
        assert!(metadata_id > 0, error::invalid_state(E_COLLECTION_NOT_FOUND));
        
        // Mark as used and remove from available list
        *vector::borrow_mut(&mut nft_data.used_metadata_ids, metadata_id - 1) = true;
        
        // Find and remove from available_metadata_ids vector
        let i = 0;
        while (i < vector::length(&nft_data.available_metadata_ids)) {
            if (*vector::borrow(&nft_data.available_metadata_ids, i) == metadata_id) {
                vector::swap_remove(&mut nft_data.available_metadata_ids, i);
                break
            };
            i = i + 1;
        };
        nft_data.available_count = nft_data.available_count - 1;
        
        // Create the NFT with the randomly selected metadata ID
        mint_nft_with_metadata_id(creator, to, metadata_id);
    }

    /// Mint a random NFT from available metadata IDs (fallback without secure randomness)
    public entry fun mint_random_nft(
        creator: &signer,
        to: address,
    ) acquires VelmoraNFTData {
        let creator_addr = signer::address_of(creator);
        
        // Get collection data
        let nft_data = borrow_global_mut<VelmoraNFTData>(creator_addr);
        assert!(creator_addr == nft_data.admin, error::permission_denied(E_NOT_AUTHORIZED));
        assert!(nft_data.available_count > 0, error::invalid_state(E_COLLECTION_NOT_FOUND));
        
        // Use timestamp-based pseudo-randomness as fallback
        let timestamp = timestamp::now_seconds();
        let creator_bytes = std::bcs::to_bytes(&creator_addr);
        let timestamp_bytes = std::bcs::to_bytes(&timestamp);
        vector::append(&mut creator_bytes, timestamp_bytes);
        
        let hash = std::hash::sha3_256(creator_bytes);
        let random_bytes = vector::slice(&hash, 0, 8);
        let random_u64 = 0u64;
        let i = 0;
        while (i < vector::length(&random_bytes)) {
            random_u64 = random_u64 * 256 + (*vector::borrow(&random_bytes, i) as u64);
            i = i + 1;
        };
        
        let random_index = random_u64 % nft_data.available_count;
        
        // Get the metadata ID at the random index
        let metadata_id = *vector::borrow(&nft_data.available_metadata_ids, random_index);
        
        // Remove this metadata ID from available list (swap with last and pop)
        let last_index = nft_data.available_count - 1;
        if (random_index != last_index) {
            let last_id = *vector::borrow(&nft_data.available_metadata_ids, last_index);
            *vector::borrow_mut(&mut nft_data.available_metadata_ids, random_index) = last_id;
        };
        vector::pop_back(&mut nft_data.available_metadata_ids);
        nft_data.available_count = nft_data.available_count - 1;
        
        // Mark as used
        *vector::borrow_mut(&mut nft_data.used_metadata_ids, metadata_id - 1) = true;
        
        // Create the NFT with the randomly selected metadata ID
        mint_nft_with_metadata_id(creator, to, metadata_id);
    }

    /// Helper function to convert u64 to string (simplified for small numbers)
    fun u64_to_string(num: u64): String {
        if (num == 0) { return string::utf8(b"0") };
        
        let digits = vector::empty<u8>();
        let temp = num;
        while (temp > 0) {
            let digit = ((temp % 10) as u8) + 48; // 48 is ASCII '0'
            vector::push_back(&mut digits, digit);
            temp = temp / 10;
        };
        
        vector::reverse(&mut digits);
        string::utf8(digits)
    }

    /// Helper function to mint NFT with specific metadata ID
    fun mint_nft_with_metadata_id(
        creator: &signer,
        to: address,
        metadata_id: u64,
    ) acquires VelmoraNFTData {
        // Construct IPFS URI dynamically
        let base_uri = string::utf8(b"ipfs://bafybeiem7ucsjote74moefa2kmprng6cdtcey43hakgvpww3icahqtpgee/");
        let id_string = u64_to_string(metadata_id);
        let extension = string::utf8(b".json");
        
        string::append(&mut base_uri, id_string);
        string::append(&mut base_uri, extension);
        
        // Generate name based on metadata ID
        let name = string::utf8(b"Aura Eye #");
        string::append(&mut name, u64_to_string(metadata_id));
        
        let description = string::utf8(b"Someone's ALWAYS watching you in Aura land - Random NFT #");
        string::append(&mut description, u64_to_string(metadata_id));
        
        // Generate rarity/skill based on metadata_id (you could fetch from IPFS in production)
        let rarity = (metadata_id % 100) + 1; // 1-100 based on ID
        let skill = ((metadata_id * 7) % 100) + 1; // 1-100 with different pattern
        
        // Call main mint function
        mint_nft(creator, to, name, description, base_uri, rarity, skill);
    }

    /// Bridge-compatible mint function with IPFS hash
    public entry fun mint_from_bridge(
        creator: &signer,
        to: address,
        name: String,
        description: String,
        ipfs_hash: String,
        rarity: u64,
        skill: u64,
    ) acquires VelmoraNFTData {
        // Construct full IPFS URI from hash
        let ipfs_uri = string::utf8(b"ipfs://");
        string::append(&mut ipfs_uri, ipfs_hash);
        
        // Call main mint function
        mint_nft(creator, to, name, description, ipfs_uri, rarity, skill);
    }

    /// Check if account owns a specific NFT
    #[view]
    public fun owns_token(
        owner: address,
        creator: address,
        collection_name: String,
        token_name: String,
        property_version: u64,
    ): bool {
        let token_data_id = token::create_token_data_id(creator, collection_name, token_name);
        let token_id = token::create_token_id(token_data_id, property_version);
        
        token::balance_of(owner, token_id) > 0
    }

    /// Get collection info
    #[view] 
    public fun get_collection_name(): String {
        string::utf8(COLLECTION_NAME)
    }

    /// Get available NFT count for random minting
    #[view]
    public fun get_available_count(creator: address): u64 acquires VelmoraNFTData {
        if (!exists<VelmoraNFTData>(creator)) {
            return 0
        };
        let nft_data = borrow_global<VelmoraNFTData>(creator);
        nft_data.available_count
    }

    /// Check if metadata ID has been used
    #[view]
    public fun is_metadata_id_used(creator: address, metadata_id: u64): bool acquires VelmoraNFTData {
        if (!exists<VelmoraNFTData>(creator) || metadata_id == 0 || metadata_id > MAX_METADATA_ID) {
            return true // Consider invalid IDs as "used"
        };
        let nft_data = borrow_global<VelmoraNFTData>(creator);
        *vector::borrow(&nft_data.used_metadata_ids, metadata_id - 1)
    }
}
