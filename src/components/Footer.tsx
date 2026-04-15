import { Link } from "react-router-dom";
import { Phone, Mail, MapPin } from "lucide-react";

const Footer = () => (
  <footer className="bg-navy-dark text-primary-foreground">
    <div className="container-main section-padding">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Col 1 */}
        <div>
          <Link to="/" className="font-heading text-2xl font-bold">
            EQUA<span className="text-gold">T</span>ION
          </Link>
          <p className="text-primary-foreground/60 text-sm mt-2 mb-4 font-body">
            Étanchéité depuis 2001
          </p>
          <div className="flex flex-col gap-3 text-sm font-body">
            <a href="https://maps.google.com/?q=74+avenue+du+Midi+63800+Cournon-d'Auvergne" target="_blank" rel="noopener" className="flex items-start gap-2 text-primary-foreground/80 hover:text-gold transition-colors">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              74 avenue du Midi, 63800 Cournon-d'Auvergne
            </a>
            <a href="tel:0473875350" className="flex items-center gap-2 text-primary-foreground/80 hover:text-gold transition-colors">
              <Phone className="w-4 h-4 shrink-0" /> 04 73 87 53 50
            </a>
            <a href="mailto:info@etanche.com" className="flex items-center gap-2 text-primary-foreground/80 hover:text-gold transition-colors">
              <Mail className="w-4 h-4 shrink-0" /> info@etanche.com
            </a>
          </div>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="font-subtitle font-semibold text-sm uppercase tracking-wider mb-4 text-gold">Nos Expertises</h4>
          <div className="flex flex-col gap-2 text-sm font-body">
            {["Étanchéité Bitumineuse", "Étanchéité Résine", "Revêtement Quartz", "Recherche de Fuite", "Dalles sur Plots", "Toiture Végétalisée"].map((e) => (
              <Link key={e} to="/expertises" className="text-primary-foreground/70 hover:text-gold transition-colors">{e}</Link>
            ))}
          </div>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="font-subtitle font-semibold text-sm uppercase tracking-wider mb-4 text-gold">L'Entreprise</h4>
          <div className="flex flex-col gap-2 text-sm font-body">
            <Link to="/a-propos" className="text-primary-foreground/70 hover:text-gold transition-colors">À Propos</Link>
            <Link to="/realisations" className="text-primary-foreground/70 hover:text-gold transition-colors">Réalisations</Link>
            <Link to="/blog" className="text-primary-foreground/70 hover:text-gold transition-colors">Blog</Link>
            <Link to="/terrasses-ipe" className="text-primary-foreground/70 hover:text-gold transition-colors">Terrasses IPE</Link>
            <Link to="/contact" className="text-primary-foreground/70 hover:text-gold transition-colors">Contact</Link>
          </div>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="font-subtitle font-semibold text-sm uppercase tracking-wider mb-4 text-gold">Informations</h4>
          <div className="flex flex-col gap-2 text-sm font-body">
            <Link to="/mentions-legales" className="text-primary-foreground/70 hover:text-gold transition-colors">Mentions légales</Link>
            <Link to="/mentions-legales" className="text-primary-foreground/70 hover:text-gold transition-colors">Politique de confidentialité</Link>
          </div>
          <div className="mt-6 flex gap-3">
            <div className="bg-green-success/20 text-green-success text-xs font-subtitle font-semibold px-3 py-1.5 rounded-md">Qualibat RGE</div>
            <div className="bg-gold/20 text-gold text-xs font-subtitle font-semibold px-3 py-1.5 rounded-md">FFB</div>
          </div>
        </div>
      </div>
    </div>
    <div className="border-t border-primary-foreground/10 py-4">
      <div className="container-main text-center text-xs text-primary-foreground/50 font-body">
        © 2001–2026 EQUATION SARL — Tous droits réservés — SIRET 435 378 567 00042
      </div>
    </div>
  </footer>
);

export default Footer;
