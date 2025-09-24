'use client';

import { NFTMetadata } from '@/types/nft';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

interface NFTModalProps {
  metadata: NFTMetadata;
  onClose: () => void;
}

export default function NFTModal({ metadata, onClose }: NFTModalProps) {
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{metadata.name}</DialogTitle>
          <DialogDescription className="text-gray-400">
            {metadata.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Image */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="p-0">
              <div className="relative aspect-square rounded-lg overflow-hidden">
                <Image
                  src={metadata.image}
                  alt={metadata.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-400">Rarity</div>
                  <div className="text-xl font-bold text-white">
                    {(metadata.rarity * 100).toFixed(2)}%
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-4">
                  <div className="text-sm text-gray-400">Skill Level</div>
                  <div className="text-xl font-bold text-white">
                    {metadata.skill}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Attributes */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">Attributes</h3>
              <ScrollArea className="h-[200px] pr-4">
                <div className="grid grid-cols-2 gap-2">
                  {metadata.attributes.map((attr, index) => (
                    <Card
                      key={index}
                      className="bg-gray-800/50 border-gray-700"
                    >
                      <CardContent className="p-3">
                        <div className="text-sm text-gray-400">
                          {attr.trait_type}
                        </div>
                        <div className="text-white font-medium truncate">
                          {attr.value}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
