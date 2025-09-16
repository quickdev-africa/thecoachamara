
// Client-side utility for uploading images to Cloudinary
export async function uploadProductImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'thecoachamara_unsigned'); // <-- Replace with your unsigned preset

  const res = await fetch('https://api.cloudinary.com/v1_1/djucbsrds/image/upload', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('Image upload failed');
  const data = await res.json();
  return data.secure_url;
}
