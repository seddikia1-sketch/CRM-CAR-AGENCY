/** تحويل رابط يوتيوب إلى رابط تضمين */
export function toEmbedVideoUrl(url: string): string | null {
  if (!url?.trim()) return null;
  const u = url.trim();

  // يوتيوب
  const yt =
    u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/) ||
    u.match(/youtube\.com\/shorts\/([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;

  // فيميو
  const vim = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vim) return `https://player.vimeo.com/video/${vim[1]}`;

  // ملف مباشر
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(u) || u.startsWith('blob:') || u.startsWith('data:')) {
    return u;
  }

  // أي رابط آخر نحاول عرضه كـ iframe
  return u;
}

export function isDirectVideo(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url) || url.startsWith('blob:') || url.startsWith('data:video');
}

/** قراءة صور من الجهاز كـ data URL */
export function readFilesAsDataUrls(files: FileList | File[]): Promise<string[]> {
  const list = Array.from(files).filter((f) => f.type.startsWith('image/'));
  return Promise.all(
    list.map(
      (file) =>
        new Promise<string>((resolve, reject) => {
          // حد تقريبي ~1.5MB لكل صورة بعد الضغط البسيط عبر canvas ليس ضرورياً هنا
          if (file.size > 2.5 * 1024 * 1024) {
            reject(new Error(`الصورة ${file.name} كبيرة جداً (الحد 2.5 ميجا)`));
            return;
          }
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('فشل قراءة الصورة'));
          reader.readAsDataURL(file);
        })
    )
  );
}
