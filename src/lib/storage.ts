import { storage } from "./firebase";
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 * @param file The file object to upload
 * @param path The storage path (e.g., 'contracts/file.pdf')
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const storageRef = ref(storage, path);

            // Use resumable upload for better reliability in modern browsers/Turbopack
            const uploadTask = uploadBytesResumable(storageRef, file);

            // SAFETY TIMEOUT: 30 seconds for upload
            const timeoutId = setTimeout(() => {
                reject(new Error("Storage upload timed out after 30 seconds."));
            }, 30000);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`[Storage] Upload is ${progress}% done`);
                },
                (error) => {
                    clearTimeout(timeoutId);
                    console.error("Firebase Storage Error:", error.code, error.message);
                    if (error.code === 'storage/retry-limit-exceeded') {
                        reject(new Error("Upload timed out or was blocked. Please check your internet and project CORS settings."));
                    } else if (error.code === 'storage/unauthorized') {
                        reject(new Error("Permission denied. You might not have access to the storage bucket."));
                    } else {
                        reject(error);
                    }
                },
                async () => {
                    clearTimeout(timeoutId);
                    try {
                        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve(downloadURL);
                    } catch (err: any) {
                        console.error("Error getting download URL:", err);
                        reject(new Error("File uploaded but URL retrieval failed: " + err.message));
                    }
                }
            );
        } catch (error) {
            console.error("Error initiating upload:", error);
            reject(error);
        }
    });
};

/**
 * Deletes a file from Firebase Storage.
 * @param path The storage path (e.g., 'contracts/file.pdf')
 */
export const deleteFile = async (path: string): Promise<void> => {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
    } catch (error) {
        console.error("Error deleting file from storage:", error);
        throw error;
    }
};
