"use client";

import { useState } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { createEvent } from "@/backend/actions/event";
import { EventType } from "@/types/schema";
import { logger } from "@/backend/lib/logger";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/frontend/lib/firebase";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select-minimal";

export default function CreateEventPage() {
    const router = useRouter();
    const { user, getIdToken } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError("Please select an image file");
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return;
        }

        setImageFile(file);
        setError(null);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile || !user) return null;

        try {
            setUploading(true);
            const timestamp = Date.now();
            const fileName = `users/${user.uid}/events/${timestamp}_${imageFile.name}`;
            const storageRef = ref(storage, fileName);

            await uploadBytes(storageRef, imageFile);
            const downloadURL = await getDownloadURL(storageRef);

            return downloadURL;
        } catch (err: any) {
            logger.error('SYSTEM_ERROR', { userId: user.uid, message: "Image upload failed", error: err.message, source: 'frontend' });
            setError("Failed to upload image. Please try again.");
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        const date = formData.get('date') as string;
        const time = formData.get('time') as string;
        const duration = parseFloat(formData.get('duration') as string) || 2;

        // Combine date and time into ISO strings
        const startTime = new Date(`${date}T${time}`).toISOString();
        const endTime = new Date(new Date(`${date}T${time}`).getTime() + duration * 60 * 60 * 1000).toISOString();

        try {
            logger.info('EVENT_CREATE_START', { userId: user.uid, source: 'frontend' });
            
            // Derive Identity via idToken
            const idToken = await getIdToken();
            if (!idToken) throw new Error("Session expired. Please log in again.");

            // Upload image if provided
            let imageUrl: string | undefined = undefined;
            if (imageFile) {
                const uploadedUrl = await uploadImage();
                if (!uploadedUrl) {
                    setIsSubmitting(false);
                    return;
                }
                imageUrl = uploadedUrl;
            }

            const result = await createEvent({
                title: formData.get('title') as string,
                description: formData.get('description') as string,
                type: formData.get('type') as EventType || 'Workshop',
                startTime,
                endTime,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                locationType: formData.get('locationType') as 'online' | 'inPerson',
                location: formData.get('location') as string,
                capacity: parseInt(formData.get('capacity') as string),
                price: parseFloat(formData.get('price') as string) || 0,
                currency: "EUR",
                imageUrl
            }, idToken);

            if (result.success) {
                logger.info('EVENT_CREATE_SUCCESS', { userId: user.uid, eventId: result.id, source: 'frontend' });
                router.push('/events');
            } else {
                logger.error('EVENT_CREATE_FAILURE', { userId: user.uid, error: result.error, source: 'frontend' });
                setError(result.error || "Failed to create event");
                setIsSubmitting(false);
            }
        } catch (err: any) {
            logger.error('EVENT_CREATE_FAILURE', { userId: user.uid, error: err.message, source: 'frontend' });
            setError(err.message || "An unexpected error occurred");
            setIsSubmitting(false);
        }
    };

    return (
        <ProtectedRoute>
            <div className="container py-8 max-w-2xl">
                <h1 className="font-serif text-3xl font-medium mb-8">Host an Event</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6 border border-border p-6 rounded-lg bg-card">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Event Title</label>
                        <Input
                            name="title"
                            required
                            placeholder="e.g. Clay Modelling for Beginners"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Event Image (Optional)</label>
                        {imagePreview ? (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border">
                                <Image
                                    src={imagePreview}
                                    alt="Event preview"
                                    fill
                                    className="object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Event Type</label>
                        <Select
                            name="type"
                            required
                        >
                            <option value="Workshop">Workshop</option>
                            <option value="Class">Class</option>
                            <option value="Gathering">Gathering</option>
                            <option value="Exhibition">Exhibition</option>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date</label>
                            <Input
                                name="date"
                                type="date"
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Time</label>
                            <Input
                                name="time"
                                type="time"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Duration (hours)</label>
                        <Input
                            name="duration"
                            type="number"
                            min="0.5"
                            step="0.5"
                            defaultValue="2"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Location Type</label>
                        <Select
                            name="locationType"
                            required
                        >
                            <option value="inPerson">In Person</option>
                            <option value="online">Online</option>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input
                            name="location"
                            required
                            placeholder="Address or Meeting Link"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Capacity</label>
                            <Input
                                name="capacity"
                                type="number"
                                min="1"
                                required
                                placeholder="20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Price (€, Free if 0)</label>
                            <Input
                                name="price"
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                placeholder="0"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            name="description"
                            required
                            rows={4}
                            placeholder="What will participants learn?"
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || uploading}>
                            {uploading ? 'Uploading Image...' : isSubmitting ? 'Publishing...' : 'Publish Event'}
                        </Button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
}
