"use client";

import { useState, useEffect, use } from "react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { updateEvent } from "@/backend/actions/event";
import { getEventById } from "@/backend/db/events";
import { EventType } from "@/types/schema";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/backend/config/firebase";
import { Upload, X, Loader2, ArrowLeft, Calendar } from "lucide-react";
import Image from "next/image";
import { cn } from "@/frontend/lib/utils";

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const { user } = useAuth();

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Workshop' as EventType,
        date: '',
        time: '',
        duration: 2,
        locationType: 'inPerson' as 'online' | 'inPerson',
        location: '',
        capacity: 20,
        price: 0,
        currentImageUrl: ''
    });

    useEffect(() => {
        if (!user) return;

        const fetchEvent = async () => {
            try {
                const event = await getEventById(id);
                if (!event) {
                    setError("Event not found");
                    setIsLoading(false);
                    return;
                }

                if (event.organizerId !== user.uid) {
                    setError("You are not authorized to edit this event");
                    setIsLoading(false);
                    return;
                }

                const startDate = new Date(event.startTime);
                const endDate = new Date(event.endTime);
                const durationHours = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);

                setFormData({
                    title: event.title,
                    description: event.description,
                    type: event.type,
                    date: startDate.toISOString().split('T')[0],
                    time: startDate.toTimeString().slice(0, 5),
                    duration: durationHours,
                    locationType: event.locationType,
                    location: event.location,
                    capacity: event.capacity,
                    price: event.price,
                    currentImageUrl: event.imageUrl || ''
                });

                if (event.imageUrl) {
                    setImagePreview(event.imageUrl);
                }

                setIsLoading(false);
            } catch (err) {
                console.error("Error fetching event:", err);
                setError("Failed to load event details");
                setIsLoading(false);
            }
        };

        fetchEvent();
    }, [id, user]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError("Please select an image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return;
        }

        setImageFile(file);

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        setFormData(prev => ({ ...prev, currentImageUrl: '' }));
    };

    const uploadImage = async (): Promise<string | null> => {
        if (!imageFile || !user) return null;

        try {
            setUploading(true);
            const timestamp = Date.now();
            const fileName = `events/${user.uid}/${timestamp}_${imageFile.name}`;
            const storageRef = ref(storage, fileName);

            await uploadBytes(storageRef, imageFile);
            const downloadURL = await getDownloadURL(storageRef);

            return downloadURL;
        } catch (err: any) {
            console.error("Image upload error:", err);
            setError("Failed to upload image. Please try again.");
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        setError(null);

        // Combine date and time
        const startTime = new Date(`${formData.date}T${formData.time}`).toISOString();
        const endTime = new Date(new Date(`${formData.date}T${formData.time}`).getTime() + formData.duration * 60 * 60 * 1000).toISOString();

        try {
            let imageUrl = formData.currentImageUrl;

            if (imageFile) {
                const uploadedUrl = await uploadImage();
                if (uploadedUrl) {
                    imageUrl = uploadedUrl;
                } else {
                    setIsSubmitting(false);
                    return;
                }
            } else if (!imagePreview && formData.currentImageUrl) {
                // Image was removed
                imageUrl = "";
            }

            const result = await updateEvent(id, user.uid, {
                title: formData.title,
                description: formData.description,
                type: formData.type,
                startTime,
                endTime,
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                locationType: formData.locationType,
                location: formData.location,
                capacity: Number(formData.capacity),
                price: Number(formData.price),
                imageUrl
            });

            if (result.success) {
                router.push(`/events/${id}`);
            } else {
                setError(result.error || "Failed to update event");
                setIsSubmitting(false);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred");
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <ProtectedRoute>
            <div className="container py-8 max-w-2xl mx-auto">
                <Button variant="ghost" className="mb-6 pl-0 hover:bg-transparent hover:text-primary group" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
                </Button>

                <div className="mb-8">
                    <h1 className="font-serif text-3xl font-medium mb-2">Edit Event</h1>
                    <p className="text-muted-foreground">Update your event details and manage availability.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8 bg-card p-6 rounded-xl border border-border shadow-sm">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Event Title</label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Pottery Workshop: Basics"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Event Image</label>
                            {imagePreview ? (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-border group">
                                    <Image
                                        src={imagePreview}
                                        alt="Event preview"
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="p-2 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-lg cursor-pointer hover:border-primary/50 hover:bg-secondary/5 transition-all">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                                        <p className="text-sm text-muted-foreground">
                                            <span className="font-semibold text-foreground">Click to upload</span> cover image
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
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="Workshop">Workshop</option>
                                <option value="Class">Class</option>
                                <option value="Gathering">Gathering</option>
                                <option value="Exhibition">Exhibition</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Date</label>
                                <Input
                                    name="date"
                                    type="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Time</label>
                                <Input
                                    name="time"
                                    type="time"
                                    value={formData.time}
                                    onChange={handleChange}
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
                                value={formData.duration}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location Type</label>
                            <select
                                name="locationType"
                                value={formData.locationType}
                                onChange={handleChange}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="inPerson">In Person</option>
                                <option value="online">Online</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Location</label>
                            <Input
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
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
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Price (€)</label>
                                <Input
                                    name="price"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={4}
                                placeholder="Describe your event..."
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-border mt-8">
                        <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting || uploading}>
                            {uploading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                </>
                            ) : isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </ProtectedRoute>
    );
}
