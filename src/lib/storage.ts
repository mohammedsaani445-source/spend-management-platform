import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

/**
 * Uploads a file to Firebase Storage and returns the public download URL.
 * @param file The file object to upload
 * @param path The storage path (e.g., 'contracts/file.pdf')
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
    try {
        const storageRef = ref(storage, path);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file to storage:", error);
        throw error;
    }
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
