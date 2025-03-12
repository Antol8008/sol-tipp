export async function uploadImage(file: File): Promise<string | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
} 