import { useNavigate } from "react-router-dom";

const CGV = () => {
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

        <h1 className="text-3xl font-bold mb-8">Conditions Générales de Vente</h1>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
          <p className="text-sm">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>

          <section className="bg-muted/30 rounded-lg p-4 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-3">Identification du Prestataire</h2>
            <ul className="space-y-1">
              <li>Nom : Adrien Beluriée</li>
              <li>Nom commercial : RedPandaDev</li>
              <li>Activité : Micro-entrepreneur</li>
              <li>SIRET : 98930587500019</li>
              <li>Adresse :1 Place Des Glasxiemes de Glasxième 17170 courçon</li>
              <li>Email : redpandadev.contact@gmail.com</li>
              <li className="italic">TVA non applicable, art. 293 B du CGI</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 1 - Objet</h2>
            <p>
              Les présentes Conditions Générales de Vente (CGV) définissent les droits et obligations
              des parties dans le cadre de la vente de prestations de services proposées par Adrien Beluriée (RedPandaDev)
              (ci-après "le Prestataire") à ses clients (ci-après "le Client").
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 2 - Champ d'application</h2>
            <p>
              Les présentes CGV s'appliquent exclusivement aux prestations de services conclues par le Prestataire
              auprès de ses Clients professionnels (personnes morales ou personnes physiques agissant dans le cadre
              de leur activité commerciale, industrielle, artisanale ou libérale). Elles ne s'appliquent pas aux
              consommateurs au sens du Code de la consommation. Le Client reconnaît avoir pris connaissance
              des présentes CGV avant sa commande.
            </p>
            <p>
              Toute commande implique l'acceptation sans réserve des présentes CGV.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 3 - Services proposés</h2>
            <p>Le Prestataire propose les services suivants :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Création de sites web</li>
              <li>Développement d'applications</li>
              <li>Maintenance et hébergement</li>
              <li>Conseil et accompagnement digital</li>
            </ul>
            <p className="mt-4">
              Les caractéristiques essentielles des services sont décrites dans les devis établis par le Prestataire.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 4 - Devis et commande</h2>
            <p>
              Tout projet fait l'objet d'un devis gratuit et personnalisé. Le devis est valable 30 jours
              à compter de sa date d'émission.
            </p>
            <p className="mt-4 font-semibold">
              Droit de refus du Prestataire :
            </p>
            <p>
              Le Prestataire se réserve le droit de refuser toute demande de devis ou de projet, sans avoir
              à justifier sa décision. Ce refus peut notamment intervenir dans les cas suivants :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Le projet dépasse les compétences techniques du Prestataire</li>
              <li>Le Prestataire ne dispose pas de la disponibilité nécessaire pour réaliser le projet dans les délais souhaités</li>
              <li>Le projet ne correspond pas aux valeurs ou à l'éthique du Prestataire</li>
              <li>Les conditions de collaboration proposées ne conviennent pas au Prestataire</li>
            </ul>
            <p className="mt-4">
              Ce refus ne peut donner lieu à aucune indemnité ou dommages-intérêts de la part du Client.
            </p>
            <p className="mt-4">
              La commande est considérée comme ferme et définitive après :
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Acceptation du devis par le Client (signature ou validation en ligne)</li>
              <li>Versement de l'acompte prévu</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 5 - Tarifs et paiement</h2>
            <p>
              Les prix sont indiqués en euros toutes taxes comprises (TTC). En tant que micro-entrepreneur,
              le Prestataire n'est pas assujetti à la TVA — <strong>TVA non applicable, art. 293 B du CGI</strong>.
            </p>
            <p className="font-semibold mt-4">Modalités de paiement :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Acompte :</strong> 30% du montant total à la commande</li>
              <li><strong>Solde :</strong> 70% à la livraison du projet</li>
            </ul>
            <p className="mt-4">
              Les paiements sont acceptés par carte bancaire via notre plateforme sécurisée (Stripe).
            </p>
            <p className="font-semibold mt-4">Pénalités de retard (art. L.441-10 du Code de commerce) :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Tout retard de paiement entraîne de plein droit des pénalités au taux de 3 fois le taux d'intérêt légal en vigueur</li>
              <li>Une indemnité forfaitaire de <strong>40 € pour frais de recouvrement</strong> est due de plein droit</li>
              <li>Ces pénalités sont exigibles sans mise en demeure préalable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 6 - Délais de réalisation</h2>
            <p>
              Les délais de réalisation sont indiqués dans le devis et courent à compter de la réception
              de l'acompte et de tous les éléments nécessaires à la réalisation de la prestation.
            </p>
            <p>
              Ces délais sont donnés à titre indicatif. Un retard raisonnable ne peut donner lieu à
              aucune pénalité ou indemnité, ni à l'annulation de la commande.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 7 - Obligations du Client</h2>
            <p>Le Client s'engage à :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Fournir tous les éléments nécessaires à la réalisation de la prestation</li>
              <li>Respecter les délais de validation convenus</li>
              <li>Procéder aux paiements selon les modalités prévues</li>
              <li>Collaborer activement à la bonne réalisation du projet</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 8 - Obligations du Prestataire</h2>
            <p>Le Prestataire s'engage à :</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Réaliser les prestations conformément au devis accepté</li>
              <li>Respecter les délais convenus dans la mesure du possible</li>
              <li>Informer le Client de l'avancement du projet</li>
              <li>Assurer la confidentialité des informations communiquées</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 9 - Livraison et réception</h2>
            <p>
              La livraison est effectuée par mise à disposition du projet sur un serveur de test ou
              par tout autre moyen convenu entre les parties.
            </p>
            <p>
              Le Client dispose d'un délai de 7 jours pour formuler ses réserves. Passé ce délai,
              la prestation est réputée acceptée.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 10 - Propriété intellectuelle</h2>
            <p>
              Le transfert de propriété des créations au Client n'intervient qu'après paiement intégral
              du prix convenu.
            </p>
            <p>
              Jusqu'au paiement complet, le Prestataire conserve tous les droits de propriété intellectuelle
              sur les créations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 11 - Absence de droit de rétractation</h2>
            <p>
              Les présentes CGV étant exclusivement destinées aux professionnels, le droit de rétractation
              prévu par le Code de la consommation (art. L.221-18) ne s'applique pas.
            </p>
            <p>
              Toute commande validée et acompte versé sont fermes et définitifs. Le Client professionnel
              ne peut pas se rétracter unilatéralement après acceptation du devis.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 12 - Résiliation</h2>
            <p>
              En cas de manquement par l'une des parties à ses obligations, le contrat pourra être
              résilié de plein droit 15 jours après mise en demeure restée infructueuse.
            </p>
            <p>
              En cas de résiliation du fait du Client après le début des travaux, les sommes versées
              resteront acquises au Prestataire à titre d'indemnité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 13 - Responsabilité</h2>
            <p>
              La responsabilité du Prestataire est limitée au montant de la commande. Le Prestataire
              ne pourra être tenu responsable des dommages indirects (perte de chiffre d'affaires,
              perte de données, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 14 - Force majeure</h2>
            <p>
              Aucune des parties ne pourra être tenue responsable de l'inexécution de ses obligations
              en cas de force majeure (catastrophe naturelle, guerre, grève, panne informatique majeure, etc.).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 15 - Règlement des litiges</h2>
            <p>
              Les présentes CGV étant réservées aux professionnels, tout litige relatif à leur interprétation
              ou exécution sera soumis aux tribunaux compétents du ressort du siège social du Prestataire,
              même en cas de pluralité de défendeurs ou d'appel en garantie.
            </p>
            <p>
              Avant toute action judiciaire, les parties s'engagent à tenter de résoudre le litige à l'amiable
              dans un délai de 30 jours à compter de la notification du différend par lettre recommandée avec
              accusé de réception.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Article 16 - Droit applicable</h2>
            <p>
              Les présentes CGV sont soumises au droit français. En cas de litige, les tribunaux
              français seront seuls compétents.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CGV;
