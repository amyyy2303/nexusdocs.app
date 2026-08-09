import * as ImagePicker from "expo-image-picker";
import * as SecureStore from "expo-secure-store";

import { auth } from "@/services/auth/firebase";

/**
 * Returns a user-specific key for the profile image.
 *
 * Each Firebase account gets its own SecureStore entry.
 */
function getProfileImageKey(): string {
  const uid = auth.currentUser?.uid;

  if (!uid) {
    throw new Error("No authenticated user.");
  }

  return `NEXUSDOCS_PROFILE_IMAGE_${uid}`;
}

/**
 * Pick and save a profile image for the
 * currently authenticated user.
 */
export async function pickProfileImage(): Promise<string | null> {
  const permission =
    await ImagePicker.requestMediaLibraryPermissionsAsync();

  if (!permission.granted) {
    throw new Error(
      "Please allow photo library permission."
    );
  }

  const result =
    await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

  if (result.canceled) {
    return null;
  }

  const imageUri = result.assets[0].uri;

  const profileImageKey =
    getProfileImageKey();

  await SecureStore.setItemAsync(
    profileImageKey,
    imageUri
  );

  return imageUri;
}

/**
 * Load the profile image belonging to
 * the currently authenticated user.
 */
export async function loadProfileImage(): Promise<
  string | null
> {
  const profileImageKey =
    getProfileImageKey();

  return await SecureStore.getItemAsync(
    profileImageKey
  );
}

/**
 * Remove only the current user's profile image.
 */
export async function removeProfileImage(): Promise<void> {
  const profileImageKey =
    getProfileImageKey();

  await SecureStore.deleteItemAsync(
    profileImageKey
  );
}