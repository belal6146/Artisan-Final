"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/contexts/AuthContext";
import { storage } from "@/backend/config/firebase";

interface ImageUploadProps {
    currentImageUrl?: string;
    onImageUploaded: (url: string) => void;
}

import { logger } from "@/backend/lib/logger";

export function ImageUpload({ currentImageUrl, onImageUploaded }: ImageUploadProps) {
    const { user } = useAuth();
    const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.[0] || !user) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            // Create local preview
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);

            // Upload to Firebase Storage
            const storageRef = ref(storage, `users/${user.uid}/avatar`);
            await uploadBytes(storageRef, file);
            const downloadUrl = await getDownloadURL(storageRef);

            onImageUploaded(downloadUrl);
            logger.info('PROFILE_UPDATE_SUCCESS', { userId: user.uid, message: "Avatar uploaded", source: 'frontend' });
        } catch (error: any) {
            logger.error('SYSTEM_ERROR', { userId: user.uid, message: "Avatar upload failed", error: error.message, source: 'frontend' });
            // Revert preview on error
            setPreview(currentImageUrl || null);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div
                className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-border group bg-secondary cursor-pointer transition-all hover:border-primary/50"
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                {preview ? (
                    <Image
                        src={preview}
                        alt="Avatar preview"
                        fill
                        className={`object-cover transition-opacity duration-300 ${uploading ? 'opacity-50' : ''}`}
                        sizes="128px"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full w-full text-muted-foreground bg-muted">
                        <Upload className="h-8 w-8 opacity-50" />
                    </div>
                )}

                {/* Loading / Action Overlay */}
                <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/40 text-white transition-opacity duration-200 ${uploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {uploading ? (
                        <>
                            <Loader2 className="h-6 w-6 animate-spin mb-1" />
                            <span className="text-xs font-medium">Uploading...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="h-6 w-6 mb-1" />
                            <span className="text-xs font-medium">Change Photo</span>
                        </>
                    )}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
                disabled={uploading}
            />
        </div>
    );
}
