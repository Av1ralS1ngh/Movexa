module velmora::coins_of_aura {
    use std::error;
    use std::signer;
    use std::string::{Self, String};
    use std::option;
    use aptos_framework::fungible_asset::{Self, Metadata, MintRef, TransferRef, BurnRef};
    use aptos_framework::object::{Self, Object};
    use aptos_framework::primary_fungible_store;
    use aptos_framework::event;

    /// Error codes
    const E_NOT_OWNER: u64 = 1;
    const E_NOT_AUTHORIZED: u64 = 2;
    const E_INSUFFICIENT_BALANCE: u64 = 3;
    const E_ALREADY_INITIALIZED: u64 = 4;

    /// Token constants
    const ASSET_NAME: vector<u8> = b"Coins of Aura";
    const ASSET_SYMBOL: vector<u8> = b"CoA";
    const DECIMALS: u8 = 8;
    const ICON_URI: vector<u8> = b"https://velmora.com/assets/coa-icon.png";
    const PROJECT_URI: vector<u8> = b"https://velmora.com";

    /// Initial mint amount for new players (650 CoA)
    const INITIAL_PLAYER_AMOUNT: u64 = 65000000000; // 650 * 10^8 (with 8 decimals)

    #[resource_group_member(group = aptos_framework::object::ObjectGroup)]
    /// Holds the MintRef, BurnRef, and TransferRef for the fungible asset
    struct ManagedFungibleAsset has key {
        mint_ref: MintRef,
        transfer_ref: TransferRef,
        burn_ref: BurnRef,
    }

    /// Events
    #[event]
    struct MintEvent has drop, store {
        recipient: address,
        amount: u64,
        timestamp: u64,
    }

    #[event]
    struct BurnEvent has drop, store {
        account: address,
        amount: u64,
        timestamp: u64,
    }

    #[event]
    struct PlayerLoginReward has drop, store {
        player: address,
        amount: u64,
        timestamp: u64,
    }

    /// Initialize the Coins of Aura token (call this once to create the token)
    public entry fun initialize(admin: &signer) {
        // Create the fungible asset
        let constructor_ref = &object::create_named_object(admin, ASSET_NAME);
        
        primary_fungible_store::create_primary_store_enabled_fungible_asset(
            constructor_ref,
            option::none(), // no maximum supply
            string::utf8(ASSET_NAME),
            string::utf8(ASSET_SYMBOL),
            DECIMALS,
            string::utf8(ICON_URI),
            string::utf8(PROJECT_URI),
        );

        // Generate the refs and store them
        let mint_ref = fungible_asset::generate_mint_ref(constructor_ref);
        let burn_ref = fungible_asset::generate_burn_ref(constructor_ref);
        let transfer_ref = fungible_asset::generate_transfer_ref(constructor_ref);
        
        let managed_fungible_asset = ManagedFungibleAsset {
            mint_ref,
            transfer_ref,
            burn_ref,
        };
        
        move_to(&object::generate_signer(constructor_ref), managed_fungible_asset);
    }

    /// Mint tokens to a specified address (only owner can call this)
    public entry fun mint(
        admin: &signer,
        to: address,
        amount: u64,
    ) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let managed_fungible_asset = authorized_borrow_refs(admin, asset);
        let to_wallet = primary_fungible_store::ensure_primary_store_exists(to, asset);
        let fa = fungible_asset::mint(&managed_fungible_asset.mint_ref, amount);
        fungible_asset::deposit_with_ref(&managed_fungible_asset.transfer_ref, to_wallet, fa);
        
        // Emit mint event
        event::emit(MintEvent {
            recipient: to,
            amount,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    /// Reward new players with 650 CoA tokens when they first login
    public entry fun reward_new_player(
        admin: &signer,
        player: address,
    ) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let managed_fungible_asset = authorized_borrow_refs(admin, asset);
        
        // Check if player already has CoA tokens (to prevent double rewards)
        let player_store = primary_fungible_store::primary_store(player, asset);
        let current_balance = fungible_asset::balance(player_store);
        
        // Only reward if balance is 0 (new player)
        if (current_balance == 0) {
            let player_wallet = primary_fungible_store::ensure_primary_store_exists(player, asset);
            let fa = fungible_asset::mint(&managed_fungible_asset.mint_ref, INITIAL_PLAYER_AMOUNT);
            fungible_asset::deposit_with_ref(&managed_fungible_asset.transfer_ref, player_wallet, fa);
            
            // Emit player reward event
            event::emit(PlayerLoginReward {
                player,
                amount: INITIAL_PLAYER_AMOUNT,
                timestamp: aptos_framework::timestamp::now_seconds(),
            });
        }
    }

    /// Burn tokens from the admin's account
    public entry fun burn(
        admin: &signer,
        amount: u64,
    ) acquires ManagedFungibleAsset {
        let asset = get_metadata();
        let managed_fungible_asset = authorized_borrow_refs(admin, asset);
        let admin_wallet = primary_fungible_store::primary_store(signer::address_of(admin), asset);
        let fa = fungible_asset::withdraw_with_ref(&managed_fungible_asset.transfer_ref, admin_wallet, amount);
        fungible_asset::burn(&managed_fungible_asset.burn_ref, fa);
        
        // Emit burn event
        event::emit(BurnEvent {
            account: signer::address_of(admin),
            amount,
            timestamp: aptos_framework::timestamp::now_seconds(),
        });
    }

    /// Transfer tokens from one account to another (public function)
    public entry fun transfer(
        from: &signer,
        to: address,
        amount: u64,
    ) {
        let asset = get_metadata();
        primary_fungible_store::transfer(from, asset, to, amount);
    }

    // === View Functions ===

    /// Get the metadata object for CoA token
    #[view]
    public fun get_metadata(): Object<Metadata> {
        let asset_address = object::create_object_address(&@velmora, ASSET_NAME);
        object::address_to_object<Metadata>(asset_address)
    }

    /// Get balance of an account
    #[view]
    public fun balance(account: address): u64 {
        let asset = get_metadata();
        primary_fungible_store::balance(account, asset)
    }

    /// Get the token name
    #[view]
    public fun name(): String {
        string::utf8(ASSET_NAME)
    }

    /// Get the token symbol
    #[view]
    public fun symbol(): String {
        string::utf8(ASSET_SYMBOL)
    }

    /// Get the number of decimals
    #[view]
    public fun decimals(): u8 {
        DECIMALS
    }

    /// Get the total supply
    #[view]
    public fun total_supply(): u128 {
        let asset = get_metadata();
        option::extract(&mut fungible_asset::supply(asset))
    }

    // === Helper Functions ===

    /// Ensure the signer is authorized and borrow the ManagedFungibleAsset resource
    inline fun authorized_borrow_refs(
        admin: &signer,
        asset: Object<Metadata>,
    ): &ManagedFungibleAsset acquires ManagedFungibleAsset {
        assert!(
            object::is_owner(asset, signer::address_of(admin)),
            error::permission_denied(E_NOT_OWNER),
        );
        borrow_global<ManagedFungibleAsset>(object::object_address(&asset))
    }

    // === Test Functions ===
    #[test_only]
    use aptos_framework::account;

    #[test(admin = @velmora)]
    fun test_initialize_and_mint(admin: &signer) acquires ManagedFungibleAsset {
        // Initialize the token
        initialize(admin);
        
        // Create a test account
        let test_addr = @0x123;
        account::create_account_for_test(test_addr);
        
        // Mint tokens
        mint(admin, test_addr, 1000 * 100000000); // 1000 CoA
        
        // Check balance
        assert!(balance(test_addr) == 1000 * 100000000, 1);
    }

    #[test(admin = @velmora)]
    fun test_reward_new_player(admin: &signer) acquires ManagedFungibleAsset {
        // Initialize the token
        initialize(admin);
        
        // Create a test player account
        let player_addr = @0x456;
        account::create_account_for_test(player_addr);
        
        // Reward new player
        reward_new_player(admin, player_addr);
        
        // Check balance (should be 650 CoA)
        assert!(balance(player_addr) == INITIAL_PLAYER_AMOUNT, 2);
        
        // Try to reward again (should not increase balance)
        reward_new_player(admin, player_addr);
        assert!(balance(player_addr) == INITIAL_PLAYER_AMOUNT, 3);
    }
}