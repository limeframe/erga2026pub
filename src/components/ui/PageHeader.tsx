import Image from "next/image";

interface PageHeaderProps {
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  description: string;
  image: string;
}

export default function PageHeader({
  title,
  titleHighlight,
  subtitle,
  description,
  image,
}: PageHeaderProps) {
  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {titleHighlight && (
                <span className="text-primary">{titleHighlight} </span>
              )}
              {title}
              {subtitle && (
                <>
                  <br />
                  <span className="text-gray-700">{subtitle}</span>
                </>
              )}
            </h1>
            <p className="mt-4 text-gray-600 leading-relaxed">{description}</p>
          </div>
          <div className="flex justify-center">
            <Image
              src={image}
              alt={title}
              width={300}
              height={250}
              className="object-contain max-h-56"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
