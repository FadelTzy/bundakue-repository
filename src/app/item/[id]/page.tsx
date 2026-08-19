import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/auth";
import { getCategoryByKey, getYouTubeEmbedUrl, getGoogleDrivePreviewUrl } from "@/lib/categories";
import LinkBadge from "@/components/LinkBadge";
import { ExternalLinkIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";

export default async function ItemDetailPage({ params }: { params: { id: string } }) {
  const session = await verifySession();
  if (!session) notFound();

  const item = await prisma.knowledgeItem.findUnique({
    where: { id: params.id },
    include: { divisions: { select: { id: true, name: true } } },
  });
  if (!item) notFound();
  if (session.role === "USER" && !item.divisions.some((d) => d.id === session.divisionId)) {
    notFound();
  }

  const category = getCategoryByKey(item.category);
  const basePath = session.role === "ADMIN" ? "/admin" : "/dashboard";
  const youtubeEmbed = item.linkType === "YOUTUBE" ? getYouTubeEmbedUrl(item.url) : null;
  const driveEmbed = item.linkType === "DRIVE" ? getGoogleDrivePreviewUrl(item.url) : null;

  const tags = item.tags
    ? item.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Link
          href={category ? `${basePath}/${category.slug}` : basePath}
          className="text-brand-600 text-sm hover:underline"
        >
          &larr; Kembali ke {category?.label || "Repository"}
        </Link>

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand-600">
            {category?.label}
          </span>
          <LinkBadge linkType={item.linkType} />
          {item.divisions.map((d) => (
            <span
              key={d.id}
              className="text-xs bg-secondary-100 text-secondary-700 rounded-full px-3 py-1"
            >
              {d.name}
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">{item.title}</h1>

        {item.description && (
          <p className="text-gray-600 mt-3 leading-relaxed">{item.description}</p>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tags.map((t) => (
              <span
                key={t}
                className="text-xs bg-secondary-100 text-secondary-700 rounded-full px-3 py-1"
              >
                {t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg"
          >
            Buka Link Sumber <ExternalLinkIcon className="w-4 h-4" />
          </a>
          {session.role === "ADMIN" && (
            <Link
              href={`${basePath}/items/${item.id}/edit`}
              className="inline-flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-white text-sm font-medium px-5 py-2.5 rounded-lg"
            >
              Ubah Dokumen
            </Link>
          )}
        </div>

        {youtubeEmbed && (
          <div className="mt-8 aspect-video rounded-xl overflow-hidden border border-gray-200 bg-black">
            <iframe
              src={youtubeEmbed}
              title={item.title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        {driveEmbed && (
          <div className="mt-8 aspect-video rounded-xl overflow-hidden border border-gray-200">
            <iframe src={driveEmbed} title={item.title} className="w-full h-full" allow="autoplay" />
          </div>
        )}
      </div>
    </div>
  );
}
