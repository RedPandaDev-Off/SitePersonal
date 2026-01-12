import React from "react";
import { useAuth } from "../lib/auth";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 py-10 px-4 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between mb-4">
          <button
            onClick={() => navigate("/")}
            className="bg-muted/40 border border-border text-blue-800 py-2 px-4 rounded-lg hover:bg-muted/60 transition text-sm font-medium"
          >
            Retour au site
          </button>
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Déconnexion
          </button>
        </div>
        <h1 className="text-4xl font-extrabold mb-6 text-center text-blue-900 drop-shadow">Bienvenue sur votre Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Profil */}
          <div className="col-span-1 bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center border border-blue-100">
            <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center text-3xl font-bold text-blue-700 mb-3">
              {user?.name?.[0]?.toUpperCase() || "C"}
            </div>
            <div className="text-lg font-semibold">{user?.name || "Client"}</div>
            <div className="text-sm text-gray-500 mb-2">{user?.email}</div>
            <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full mt-2">Client</span>
          </div>
          {/* Résumé */}
          <div className="col-span-2 bg-gradient-to-tr from-blue-50 to-blue-200 rounded-2xl shadow-lg p-6 flex flex-col justify-center border border-blue-100">
            <div className="flex flex-col md:flex-row md:space-x-8 items-center justify-between">
              <div className="mb-4 md:mb-0">
                <div className="text-2xl font-bold text-blue-800">0</div>
                <div className="text-gray-600">Devis en cours</div>
              </div>
              <div className="mb-4 md:mb-0">
                <div className="text-2xl font-bold text-blue-800">0</div>
                <div className="text-gray-600">Projets réalisés</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-800">0 €</div>
                <div className="text-gray-600">Total payé</div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="bg-white rounded-2xl shadow p-6 border border-blue-100">
            <h2 className="text-xl font-semibold mb-2 text-blue-800">Vos Informations</h2>
            <p className="text-gray-600 mb-2">Affichez et gérez vos informations personnelles ici.</p>
            <ul className="text-gray-700">
              <li><span className="font-medium">Nom :</span> {user?.name}</li>
              <li><span className="font-medium">Email :</span> {user?.email}</li>
            </ul>
          </section>

          <section className="bg-white rounded-2xl shadow p-6 border border-blue-100">
            <h2 className="text-xl font-semibold mb-2 text-blue-800">Historique des Transactions</h2>
            <p className="text-gray-600 mb-2">Consultez vos transactions passées et leurs détails.</p>
            <div className="text-gray-500 italic">Aucune transaction pour le moment.</div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
