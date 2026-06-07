import { useNavigate } from "react-router-dom";

const Confidentialite = () => {
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

        <h1 className="text-3xl font-bold mb-8">Politique de Confidentialité</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">1. Introduction</h2>
            <p>
              La présente politique de confidentialité décrit comment Adrien Beluriée (RedPandaDev)
              (ci-après "nous", "notre", "nos") collecte, utilise et protège vos données personnelles
              lorsque vous utilisez notre site web et nos services.
            </p>
            <p>
              Nous nous engageons à respecter votre vie privée et à protéger vos données personnelles
              conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi
              Informatique et Libertés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">2. Responsable du traitement</h2>
            <p>Le responsable du traitement des données est :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nom : Adrien Beluriée (RedPandaDev)</li>
              <li>Adresse : 1 Place Des Glasxiemes de Glasxième</li>
              <li>Email : redpandadev.contact@gmail.com</li>
              <li>SIRET : 98930587500019</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">3. Données collectées</h2>
            <p>Nous collectons les données suivantes :</p>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">3.1 Données fournies directement</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Données d'identification :</strong> nom, prénom, email</li>
              <li><strong>Données de contact :</strong> adresse email, numéro de téléphone</li>
              <li><strong>Données de facturation :</strong> adresse de facturation</li>
              <li><strong>Données de projet :</strong> description de vos besoins, fichiers transmis</li>
            </ul>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">3.2 Données collectées automatiquement</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Données de connexion :</strong> adresse IP, type de navigateur, système d'exploitation</li>
              <li><strong>Données de navigation :</strong> pages visitées, durée de visite</li>
              <li><strong>Cookies :</strong> voir section dédiée ci-dessous</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">4. Finalités du traitement</h2>
            <p>Vos données sont collectées pour les finalités suivantes :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Gestion de votre compte utilisateur</li>
              <li>Traitement de vos demandes de devis</li>
              <li>Exécution de nos prestations de services</li>
              <li>Facturation et paiement (via Stripe)</li>
              <li>Communication avec vous concernant votre projet</li>
              <li>Amélioration de nos services et de notre site</li>
              <li>Respect de nos obligations légales</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">5. Base légale du traitement</h2>
            <p>Le traitement de vos données repose sur :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>L'exécution du contrat :</strong> pour la gestion de vos commandes et projets</li>
              <li><strong>Votre consentement :</strong> pour les cookies non essentiels</li>
              <li><strong>Notre intérêt légitime :</strong> pour l'amélioration de nos services</li>
              <li><strong>Nos obligations légales :</strong> pour la facturation et la comptabilité</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">6. Destinataires des données</h2>
            <p>Vos données peuvent être partagées avec :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Stripe :</strong> pour le traitement des paiements (voir leur politique de confidentialité)</li>
              <li><strong>Notre hébergeur :</strong> pour l'hébergement du site et des données</li>
              <li><strong>Autorités compétentes :</strong> en cas d'obligation légale</li>
            </ul>
            <p className="mt-4">
              Nous ne vendons jamais vos données personnelles à des tiers.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">7. Durée de conservation</h2>
            <p>Vos données sont conservées pendant :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Compte utilisateur :</strong> jusqu'à suppression du compte + 3 ans</li>
              <li><strong>Données de facturation :</strong> 10 ans (obligation légale)</li>
              <li><strong>Données de projet :</strong> 5 ans après la fin du projet</li>
              <li><strong>Cookies :</strong> 13 mois maximum</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">8. Vos droits</h2>
            <p>Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Droit d'accès :</strong> obtenir une copie de vos données</li>
              <li><strong>Droit de rectification :</strong> corriger vos données inexactes</li>
              <li><strong>Droit à l'effacement :</strong> demander la suppression de vos données</li>
              <li><strong>Droit à la limitation :</strong> limiter le traitement de vos données</li>
              <li><strong>Droit à la portabilité :</strong> recevoir vos données dans un format structuré</li>
              <li><strong>Droit d'opposition :</strong> vous opposer au traitement de vos données</li>
              <li><strong>Droit de retirer votre consentement :</strong> à tout moment</li>
            </ul>
            <p className="mt-4">
              Pour exercer vos droits, contactez-nous à : redpandadev.contact@gmail.com
            </p>
            <p>
              Vous pouvez également introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cnil.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">9. Cookies</h2>
            <p>
              Notre site utilise des cookies pour fonctionner correctement et améliorer votre expérience.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">9.1 Cookies essentiels</h3>
            <p>
              Ces cookies sont nécessaires au fonctionnement du site (authentification, sécurité).
              Ils ne peuvent pas être désactivés.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">9.2 Cookies de performance</h3>
            <p>
              Ces cookies nous permettent de comprendre comment vous utilisez notre site pour l'améliorer.
              Ils sont soumis à votre consentement.
            </p>

            <h3 className="text-lg font-medium text-foreground mt-4 mb-2">9.3 Gestion des cookies</h3>
            <p>
              Vous pouvez gérer vos préférences de cookies via le bandeau de consentement affiché lors
              de votre première visite, ou en modifiant les paramètres de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">10. Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité appropriées pour protéger vos données :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Chiffrement des données en transit (HTTPS/SSL)</li>
              <li>Authentification sécurisée (JWT)</li>
              <li>Mots de passe hashés (bcrypt)</li>
              <li>Accès restreint aux données personnelles</li>
              <li>Sauvegardes régulières</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">11. Transferts de données</h2>
            <p>
              Certaines de vos données peuvent être traitées par des prestataires situés en dehors de
              l'Union Européenne (notamment Stripe aux États-Unis). Ces transferts sont encadrés par
              des garanties appropriées (clauses contractuelles types, décision d'adéquation).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">12. Modification de la politique</h2>
            <p>
              Nous pouvons modifier cette politique de confidentialité à tout moment. La date de
              dernière mise à jour est indiquée en haut de cette page. Nous vous informerons de
              tout changement significatif.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">13. Contact</h2>
            <p>
              Pour toute question concernant cette politique ou vos données personnelles, contactez-nous :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Email : redpandadev.contact@gmail.com</li>
              <li>Adresse : 1 Place Des Glasxiemes de Glasxième, 17170 Courçon</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Confidentialite;
