import PageHero from "@/components/PageHero";
import Breadcrumbs from "@/components/Breadcrumbs";

const MentionsLegales = () => (
  <>
    <PageHero title="Mentions Légales" />
    <Breadcrumbs items={[{ label: "Mentions légales" }]} />

    <section className="container-main section-padding">
      <div className="max-w-3xl mx-auto prose font-body text-foreground space-y-6">
        <h2 className="text-foreground">Éditeur du site</h2>
        <p className="text-muted-foreground">
          <strong>EQUATION SARL</strong><br />
          Capital social : 50 000 €<br />
          SIRET : 435 378 567 00042<br />
          Siège social : 74 avenue du Midi, 63800 Cournon-d'Auvergne<br />
          Téléphone : 04 73 87 53 50<br />
          Email : info@etanche.com<br />
          Directeur de la publication : Thierry Meylan
        </p>

        <h2 className="text-foreground">Hébergement</h2>
        <p className="text-muted-foreground">Ce site est hébergé par Lovable.</p>

        <h2 className="text-foreground">Protection des données personnelles (RGPD)</h2>
        <p className="text-muted-foreground">
          Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d'un droit d'accès, de rectification, de suppression et d'opposition aux données personnelles vous concernant. Les données collectées via le formulaire de contact sont uniquement utilisées pour traiter votre demande et ne sont pas transmises à des tiers. Pour exercer vos droits, contactez-nous à info@etanche.com.
        </p>

        <h2 className="text-foreground">Cookies</h2>
        <p className="text-muted-foreground">
          Ce site utilise des cookies techniques nécessaires à son bon fonctionnement. Aucun cookie publicitaire ou de suivi n'est utilisé.
        </p>

        <h2 className="text-foreground">Propriété intellectuelle</h2>
        <p className="text-muted-foreground">
          L'ensemble du contenu de ce site (textes, images, logos, vidéos) est la propriété exclusive d'EQUATION SARL, sauf mention contraire. Toute reproduction, même partielle, est interdite sans autorisation préalable.
        </p>
      </div>
    </section>
  </>
);

export default MentionsLegales;
