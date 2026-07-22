import { Platform } from "react-native";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export async function uploadPhoto(localUri: string): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary no está configurado (faltan variables de entorno)");
  }

  const form = new FormData();
  if (Platform.OS === "web") {
    // En web `localUri` ya es un data URL completo; Cloudinary lo acepta
    // como string directamente.
    form.append("file", localUri);
  } else {
    // En native es un file://; FormData necesita el objeto RN de siempre
    // para que se suban los bytes reales, no la ruta como texto.
    form.append("file", {
      uri: localUri,
      type: "image/jpeg",
      name: "photo.jpg",
    } as unknown as Blob);
  }
  form.append("upload_preset", UPLOAD_PRESET);
  form.append("folder", "bounty");

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message ?? "No se pudo subir la foto");
  }

  const json = await response.json();
  return json.secure_url as string;
}
