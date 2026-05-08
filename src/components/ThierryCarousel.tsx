import { useEffect, useState } from "react";
import img1 from "@/assets/carrousel-1.jpg";
import img2 from "@/assets/carrousel-2.jpg";
import img3 from "@/assets/carrousel-3.jpg";
import img4 from "@/assets/carrousel-4.jpg";
import img5 from "@/assets/carrousel-5.jpg";
import img6 from "@/assets/carrousel-6.jpg";

const slides = [
  { src: img1, alt: "Thierry Meylan sur chantier - logistique camion EQUATION Étanchéité Auvergne" },
  { src: img2, alt: "Réalisation terrasse IPE par l'équipe de Thierry Meylan, EQUATION" },
  { src: img3, alt: "Pose d'étanchéité bitumineuse supervisée par Thierry Meylan" },
  { src: img4, alt: "Toiture avec garde-corps - expertise sécurité Thierry Meylan EQUATION" },
  { src: img5, alt: "Application résine d'étanchéité blanche, savoir-faire EQUATION" },
  { src: img6, alt: "Schéma d'isolation toiture terrasse - bureau d'études EQUATION" },
];

const ThierryCarousel = () => {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 4000);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <div
      className="relative mt-4 rounded-lg overflow-hidden shadow-md h-[180px] md:h-[250px] bg-muted"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Photos complémentaires de Thierry Meylan et de l'équipe EQUATION"
    >
      {slides.map((s, i) => (
        <img
          key={i}
          src={s.src}
          alt={s.alt}
          loading="lazy"
          decoding="async"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Aller à la photo ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-white" : "w-1.5 bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ThierryCarousel;
