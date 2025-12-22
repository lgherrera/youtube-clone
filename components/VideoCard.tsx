import Link from 'next/link';

export default function VideoCard({ video }: { video: any }) {
  return (
    <div className="w-full mb-4">
      <Link href={`/video/${video.id}`}>
        <div className="relative w-full overflow-hidden" style={{ aspectRatio: '768/432' }}>
          <img 
            src={video.thumbnail_url} 
            alt={video.title}
            className="w-full h-full object-cover bg-zinc-800"
          />
        </div>
      </Link>
      <div className="p-3 flex gap-3">
        <div className="w-9 h-9 rounded-full bg-zinc-700 shrink-0" />
        <div>
          <h3 className="text-sm font-semibold line-clamp-2">{video.title}</h3>
          <p className="text-xs text-zinc-400 mt-1">YouTube Clone • 10K views</p>
        </div>
      </div>
    </div>
  );
}
