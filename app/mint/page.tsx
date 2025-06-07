'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Upload, Image as ImageIcon, Sparkles, Plus, X, Eye, CheckCircle } from 'lucide-react';
import { useWallet } from '@/hooks/useWallet';
import { useNFTStore } from '@/hooks/useNFTStore';
import { toast } from 'sonner';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface NFTAttribute {
  trait_type: string;
  value: string;
}

export default function MintPage() {
  const router = useRouter();
  const { isConnected, selectedAccount } = useWallet();
  const { mintNFT, isLoading } = useNFTStore();
  const [step, setStep] = useState(1);
  const [mintedNFT, setMintedNFT] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    collection: '',
    royalties: '5',
    price: '',
    forSale: false,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [attributes, setAttributes] = useState<NFTAttribute[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast.error('File size must be less than 10MB');
        return;
      }
      
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const addAttribute = () => {
    setAttributes([...attributes, { trait_type: '', value: '' }]);
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const updateAttribute = (index: number, field: keyof NFTAttribute, value: string) => {
    const updated = [...attributes];
    updated[index][field] = value;
    setAttributes(updated);
  };

  const handleMint = async () => {
    if (!isConnected || !selectedAccount) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!selectedFile || !formData.name || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Create NFT data
      const nftData = {
        collectionId: formData.collection ? parseInt(formData.collection) : 1,
        itemId: Date.now(),
        owner: selectedAccount.address,
        creator: selectedAccount.address,
        metadata: {
          name: formData.name,
          description: formData.description,
          image: previewUrl, // In production, this would be uploaded to IPFS
          attributes: attributes.filter(attr => attr.trait_type && attr.value),
        },
        price: formData.forSale && formData.price ? parseFloat(formData.price) : undefined,
        isForSale: formData.forSale,
      };

      // Mint the NFT
      const newNFT = await mintNFT(nftData);
      setMintedNFT(newNFT);
      
      toast.success('NFT minted successfully!');
      setStep(4); // Go to success step
      
    } catch (error) {
      toast.error('Failed to mint NFT. Please try again.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      collection: '',
      royalties: '5',
      price: '',
      forSale: false,
    });
    setSelectedFile(null);
    setPreviewUrl('');
    setAttributes([]);
    setMintedNFT(null);
    setStep(1);
  };

  const nextStep = () => {
    if (step === 1 && (!selectedFile || !formData.name || !formData.description)) {
      toast.error('Please complete all required fields');
      return;
    }
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            Create Your <span className="bg-gradient-to-r from-pink-400 to-blue-400 bg-clip-text text-transparent">NFT</span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform your digital art into a unique collectible on Polkadot Asset Hub
          </p>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                  step >= stepNumber 
                    ? 'bg-gradient-to-r from-pink-500 to-blue-500 text-white' 
                    : 'glass border-white/20 text-gray-400'
                }`}>
                  {step > stepNumber ? <CheckCircle className="w-5 h-5" /> : stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                    step > stepNumber ? 'bg-gradient-to-r from-pink-500 to-blue-500' : 'bg-white/20'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {step === 1 && (
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <ImageIcon className="w-6 h-6 mr-2 text-pink-400" />
                  Upload & Basic Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* File Upload */}
                <div className="space-y-2">
                  <Label className="text-white">Upload File *</Label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*,video/*,audio/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="glass-hover border-2 border-dashed border-white/20 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 hover:border-pink-400"
                    >
                      {previewUrl ? (
                        <div className="relative w-full max-w-md">
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            width={400}
                            height={400}
                            className="rounded-lg object-cover"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedFile(null);
                              setPreviewUrl('');
                            }}
                            className="absolute top-2 right-2 glass"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-12 h-12 text-pink-400 mb-4" />
                          <p className="text-white font-medium mb-2">Choose file to upload</p>
                          <p className="text-gray-400 text-sm">PNG, JPG, GIF, MP4, MP3 up to 10MB</p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-white">Name *</Label>
                    <Input
                      placeholder="Enter NFT name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="glass border-white/20 focus:border-pink-400"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Collection</Label>
                    <Select value={formData.collection} onValueChange={(value) => setFormData({...formData, collection: value})}>
                      <SelectTrigger className="glass border-white/20">
                        <SelectValue placeholder="Select collection" />
                      </SelectTrigger>
                      <SelectContent className="glass border-white/20">
                        <SelectItem value="1">Digital Art</SelectItem>
                        <SelectItem value="2">Photography</SelectItem>
                        <SelectItem value="3">Abstract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white">Description *</Label>
                  <Textarea
                    placeholder="Describe your NFT..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="glass border-white/20 focus:border-pink-400 min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {step === 2 && (
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <Sparkles className="w-6 h-6 mr-2 text-pink-400" />
                  Properties & Attributes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Attributes */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-white">Attributes</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addAttribute}
                      className="border-pink-400 text-pink-400 hover:bg-pink-400 hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Attribute
                    </Button>
                  </div>
                  
                  {attributes.map((attr, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="glass rounded-lg p-4 flex items-center space-x-4"
                    >
                      <Input
                        placeholder="Trait type (e.g., Color)"
                        value={attr.trait_type}
                        onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                        className="glass border-white/20"
                      />
                      <Input
                        placeholder="Value (e.g., Blue)"
                        value={attr.value}
                        onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                        className="glass border-white/20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAttribute(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>

                {/* Royalties */}
                <div className="space-y-2">
                  <Label className="text-white">Royalties (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    placeholder="5"
                    value={formData.royalties}
                    onChange={(e) => setFormData({...formData, royalties: e.target.value})}
                    className="glass border-white/20 focus:border-pink-400"
                  />
                  <p className="text-sm text-gray-400">Percentage you'll receive from secondary sales</p>
                </div>

                {/* For Sale Option */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.forSale}
                      onCheckedChange={(checked) => setFormData({...formData, forSale: checked})}
                    />
                    <Label className="text-white">List for sale immediately</Label>
                  </div>

                  {formData.forSale && (
                    <div className="space-y-2">
                      <Label className="text-white">Price (PAS)</Label>
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="glass border-white/20 focus:border-pink-400"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {step === 3 && (
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <Eye className="w-6 h-6 mr-2 text-pink-400" />
                  Review & Mint
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    {previewUrl && (
                      <div className="glass rounded-xl overflow-hidden">
                        <Image
                          src={previewUrl}
                          alt="NFT Preview"
                          width={400}
                          height={400}
                          className="w-full aspect-square object-cover"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">{formData.name}</h3>
                      <p className="text-gray-300">{formData.description}</p>
                    </div>
                    
                    {attributes.length > 0 && (
                      <div>
                        <h4 className="text-lg font-semibold text-white mb-2">Attributes</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {attributes.filter(attr => attr.trait_type && attr.value).map((attr, index) => (
                            <div key={index} className="glass rounded-lg p-3">
                              <div className="text-xs text-gray-400">{attr.trait_type}</div>
                              <div className="text-sm font-medium text-white">{attr.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="glass rounded-lg p-4">
                      <div className="text-sm text-gray-400">Royalties</div>
                      <div className="text-lg font-bold text-pink-400">{formData.royalties}%</div>
                    </div>

                    {formData.forSale && formData.price && (
                      <div className="glass rounded-lg p-4">
                        <div className="text-sm text-gray-400">Price</div>
                        <div className="text-lg font-bold text-green-400">{formData.price} PAS</div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {step === 4 && mintedNFT && (
            <Card className="glass border-white/20">
              <CardHeader>
                <CardTitle className="text-2xl text-white flex items-center">
                  <CheckCircle className="w-6 h-6 mr-2 text-green-400" />
                  NFT Minted Successfully!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500/20 to-blue-500/20 flex items-center justify-center">
                    <CheckCircle className="w-12 h-12 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Congratulations!</h3>
                  <p className="text-gray-300 mb-6">Your NFT has been successfully minted and is now available in your collection.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass rounded-xl overflow-hidden">
                    <Image
                      src={mintedNFT.metadata.image}
                      alt={mintedNFT.metadata.name}
                      width={300}
                      height={300}
                      className="w-full aspect-square object-cover"
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-lg font-bold text-white">{mintedNFT.metadata.name}</h4>
                      <p className="text-gray-400">NFT ID: {mintedNFT.id}</p>
                      <p className="text-gray-400">Owner: {mintedNFT.owner.slice(0, 8)}...</p>
                    </div>
                    
                    <div className="glass rounded-lg p-4">
                      <div className="text-sm text-gray-400">Status</div>
                      <div className="text-lg font-bold text-green-400">
                        {mintedNFT.isForSale ? 'Listed for Sale' : 'In Collection'}
                      </div>
                    </div>

                    {mintedNFT.price && (
                      <div className="glass rounded-lg p-4">
                        <div className="text-sm text-gray-400">Price</div>
                        <div className="text-lg font-bold text-pink-400">{mintedNFT.price} PAS</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/gallery" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600">
                      View in Gallery
                    </Button>
                  </Link>
                  
                  <Link href="/auctions/create" className="flex-1">
                    <Button variant="outline" className="w-full border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white">
                      Create Auction
                    </Button>
                  </Link>
                  
                  <Button
                    onClick={resetForm}
                    variant="outline"
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Mint Another
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Navigation */}
        {step < 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-between mt-8"
          >
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={step === 1}
              className="border-white/20 text-black hover:bg-white/10"
            >
              Previous
            </Button>
            
            {step < 3 ? (
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
              >
                Next Step
              </Button>
            ) : (
              <Button
                onClick={handleMint}
                disabled={isLoading || !isConnected}
                className="bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600"
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner w-4 h-4 mr-2" />
                    Minting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Mint NFT
                  </>
                )}
              </Button>
            )}
          </motion.div>
        )}

        {!isConnected && step < 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-6 mt-8 text-center border border-yellow-500/50"
          >
            <p className="text-yellow-400 mb-4">Please connect your wallet to mint NFTs</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}