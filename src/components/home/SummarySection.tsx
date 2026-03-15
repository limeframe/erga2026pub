import Image from "next/image";

interface SummarySectionProps {
  title: string;
  title2: string;
  titlebr3: string;
  titlebr4: string;
  description: string;
  mapImage: string;
}

export default function SummarySection({
  title,
  title2,
  titlebr3,
  titlebr4,
  description,
  mapImage,
}: SummarySectionProps) {
  return (
    <section className="pt-20 pb-32">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center">
          <div className="w-full md:w-1/2 mt-3">
            <h1
              style={{
                fontWeight: 800,
                fontSize: "34px",
                lineHeight: "42px",
                letterSpacing: "1.36px",
              }}
            >
              {title}
              {title2}
              <br />
              <span className="text-primary">{titlebr3}</span>
              <br />
              <span className="text-primary">{titlebr4}</span>
            </h1>
            <p className="mt-3 text-base text-gray-900">{description}</p>
          </div>
          <div className="w-full md:w-1/2 flex justify-end items-center mt-4 md:mt-0">
            <Image
              src={mapImage}
              alt="Χάρτης Πελοποννήσου"
              width={400}
              height={300}
              className="max-h-72 w-auto object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
