"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2, Star, Trash2 } from "lucide-react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import { storage } from "@/backend/config/firebase";
import { cn } from "@/frontend/lib/utils";

interface ArtworkImageUploadProps {
    imageUrls: string[];
    onImagesChange: (urls: string[]) => void;
    maxImages?: number;
}

export function ArtworkImageUpload({ imageUrls = [], onImagesChange, maxImages = 5 }: ArtworkImageUploadProps) {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !user) return;

        const files = Array.from(e.target.files);
        if (imageUrls.length + files.length > maxImages) {
            alert(`You can only upload up to ${maxImages} images.`);
            return;
        }

        setUploading(true);
        const newUrls: string[] = [];

        try {
            for (const file of files) {
                // Determine file path: users/{uid}/artworks/{timestamp}_{filename}
                const timestamp = Date.now();
                const storageRef = ref(storage, `users/${user.uid}/artworks/${timestamp}_${file.name}`);

                await uploadBytes(storageRef, file);
                const downloadUrl = await getDownloadURL(storageRef);
                newUrls.push(downloadUrl);
            }

            onImagesChange([...imageUrls, ...newUrls]);
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload images. Please try again.");
        } finally {
            setUploading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const removeImage = (indexToRemove: number) => {
        const newUrls = imageUrls.filter((_, index) => index !== indexToRemove);
        onImagesChange(newUrls);
    };

    const makePrimary = (indexToPrimary: number) => {
        if (indexToPrimary === 0) return;
        const newUrls = [...imageUrls];
        const [movedImage] = newUrls.splice(indexToPrimary, 1);
        newUrls.unshift(movedImage);
        onImagesChange(newUrls);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imageUrls.map((url, index) => (
                    <div key={url} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                        <Image
                            src={url}
                            alt={`Artwork image ${index + 1}`}
                            fill
                            className="object-cover"
                        />

                        {/* Overlay Actions */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {index !== 0 && (
                                <Button
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8"
                                    onClick={() => makePrimary(index)}
                                    title="Set as Primary"
                                >
                                    <Star className="h-4 w-4" />
                                </Button>
                            )}
                            <Button
                                size="icon"
                                variant="destructive"
                                className="h-8 w-8"
                                onClick={() => removeImage(index)}
                                title="Remove Image"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Primary Badge */}
                        {index === 0 && (
                            <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium shadow-sm">
                                Primary
                            </div>
                        )}
                    </div>
                ))}

                {/* Upload Button */}
                {imageUrls.length < maxImages && (
                    <div
                        className={cn(
                            "aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-secondary/10 transition-colors",
                            uploading && "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                    >
                        {uploading ? (
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        ) : (
                            <>
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-sm text-muted-foreground font-medium">Add Image</span>
                                <span className="text-xs text-muted-foreground/75 mt-1">
                                    {imageUrls.length}/{maxImages}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
            />

            <p className="text-xs text-muted-foreground">
                First image will be the main display. Drag files or click to upload. Max {maxImages} images.
            </p>
        </div>
    );
}
