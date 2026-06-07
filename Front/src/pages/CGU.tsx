import { useNavigate } from "react-router-dom";

const CGU = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-primary hover:underline"
        >
          &larr; Retour
        </button>

        <h1 className="text-3xl font-bold mb-8">Conditions Générales d'Utilisation</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 1 - Objet</h2>
            <p>
              Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités
              et conditions d'utilisation du site RedPandaDev (ci-après "le Site"), ainsi que de
              définir les droits et obligations des parties dans ce cadre.
            </p>
            <p>
              L'accès et l'utilisation du Site sont soumis à l'acceptation et au respect des présentes CGU.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 2 - Mentions légales</h2>
            <p>Le Site est édité par :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nom : Adrien Beluriée</li>
              <li>Nom commercial : RedPandaDev</li>
              <li>Statut : Micro-entrepreneur</li>
              <li>Siège social : 1 Place Des Glasxiemes de Glasxième</li>
              <li>SIRET : 98930587500019</li>
              <li>Email : redpandadev.contact@gmail.com</li>
              <li>Directeur de la publication : Adrien Beluriée</li>
            </ul>
            <p className="mt-4">Hébergeur :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nom : Hostinger International Ltd</li>
              <li>Adresse : 61 Lordou Vironos str., 6023 Larnaca, Chypre</li>
              <li>Site web : www.hostinger.fr</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 3 - Accès au Site</h2>
            <p>
              Le Site est accessible gratuitement à tout utilisateur disposant d'un accès à Internet.
              Tous les coûts afférents à l'accès au Site, que ce soient les frais matériels, logiciels
              ou d'accès à Internet sont exclusivement à la charge de l'utilisateur.
            </p>
            <p>
              L'éditeur se réserve le droit de modifier, suspendre ou interrompre l'accès au Site à tout moment,
              sans préavis et sans indemnité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 4 - Compte utilisateur</h2>
            <p>
              L'accès à certains services nécessite la création d'un compte utilisateur. L'utilisateur
              s'engage à fournir des informations exactes et à jour lors de son inscription.
            </p>
            <p>
              L'utilisateur est responsable de la confidentialité de ses identifiants de connexion et
              de toutes les activités effectuées depuis son compte.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 5 - Propriété intellectuelle</h2>
            <p>
              L'ensemble des éléments du Site (textes, images, logos, icônes, sons, logiciels, etc.)
              sont protégés par les droits de propriété intellectuelle et appartiennent à l'éditeur
              ou font l'objet d'une autorisation d'utilisation.
            </p>
            <p>
              Toute reproduction, représentation, modification ou exploitation non autorisée de tout
              ou partie du Site est interdite et peut donner lieu à des poursuites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 6 - Responsabilité</h2>
            <p>
              L'éditeur s'efforce de fournir des informations aussi précises que possible. Toutefois,
              il ne pourra être tenu responsable des omissions, inexactitudes ou carences dans la mise
              à jour des informations.
            </p>
            <p>
              L'utilisateur est seul responsable de l'utilisation qu'il fait des informations et contenus
              présents sur le Site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 7 - Liens hypertextes</h2>
            <p>
              Le Site peut contenir des liens vers d'autres sites. L'éditeur n'exerce aucun contrôle
              sur ces sites et décline toute responsabilité quant à leur contenu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 8 - Protection des données personnelles</h2>
            <p>
              Les données personnelles collectées sur le Site font l'objet d'un traitement informatique
              conformément à notre <a href="/confidentialite" className="text-primary hover:underline">Politique de confidentialité</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 9 - Cookies</h2>
            <p>
              Le Site utilise des cookies pour améliorer l'expérience utilisateur. Pour en savoir plus,
              consultez notre <a href="/confidentialite" className="text-primary hover:underline">Politique de confidentialité</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 10 - Droit applicable</h2>
            <p>
              Les présentes CGU sont régies par le droit français. Tout litige relatif à l'interprétation
              ou à l'exécution des présentes sera soumis aux tribunaux français compétents.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 11 - Modification des CGU</h2>
            <p>
              L'éditeur se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs
              seront informés de toute modification par la mise à jour de la date en haut de cette page.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CGU;
