// app/(main)/admin/upload/page.tsx
import VideoUploadForm from '@/components/admin/VideoUploadForm';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-black py-8">
      <VideoUploadForm />
    </div>
  );
}