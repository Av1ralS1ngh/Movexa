export interface NFTAttribute {
  trait_type: string;
  value: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  external_url: string;
  image: string;
  attributes: NFTAttribute[];
  properties: {
    files: {
      uri: string;
      type: string;
    }[];
    category: string;
    creators: any[];
  };
  compiler: string;
  rarity: number;
  skill: number;
}
