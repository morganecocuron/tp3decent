# -*- coding: utf-8 -*-
"""
Created on Mon Feb  3 15:01:52 2025

@author: jean-
"""

import requests
import json
from collections import Counter

#Chemin du fichier de bdd ou sont stockées les infos de chaque modèle
DB_FILE = "model_balances.json"
#Solde intitial pour chaque modèle à l'inscription
INITIAL_BALANCE = 1000
#Pénalité appliquée aux modèles ne respectant pas les attentes
SLASHING_PENALTY = 50 

urls = [
    "https://5ca8-89-30-29-68.ngrok-free.app/predict",
    "https://cbda-89-30-29-70.ngrok-free.app/predict",
    "https://db76-89-30-29-68.ngrok-free.app/predict",
    "https://0e66-89-30-29-68.ngrok-free.app/predict",
]

#Chargement ou initialisation de la base de données
def load_db():
    try:
        #Essaie de charger la bdd depuis le fichier json
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except FileNotFoundError:
        #Initialisation avec un dépôt de 1000€ et un poids de 1 pour chaque modèle
        return {url: {"balance": INITIAL_BALANCE, "weight": 1.0} for url in urls}

#Fonction pour sauvegarder la base de données mise à jour dans le fichier JSON
def save_db(db):
    with open(DB_FILE, "w") as f:
        json.dump(db, f, indent=4)
        

#Charger la bdd
db = load_db()


#Paramètres des caractéristiques (features) à envoyer à chaque modèle
params = {
    "feature0": 5.1,
    "feature1": 3.5,
    "feature2": 1.4,
    "feature3": 0.2
}

#Listes pour stocker les prédictions et les précisions des modèles
predictions = []
accuracies = []
model_data = {}

#Boucle pour interroger chaque modèle et récupérer ses prédictions et précisions
for url in urls:
    try:
        response = requests.get(url, params=params)
        data = response.json()
        prediction = data["prediction"]
        accuracy = data.get("accuracy", 0)  
        predictions.append(prediction)
        accuracies.append(accuracy)
        model_data[url] = {"prediction": prediction, "accuracy": accuracy}
    except Exception as e:
        print(f"Erreur avec {url}: {e}")


if predictions:
    #Créer un objet pour stocker les votes pondérés des modèles
    weighted_votes = Counter()
    #Ajouter les votes des modèles en tenant compte de leur poids (balance)
    for url, data in model_data.items():
        weighted_votes[data["prediction"]] += db[url]["weight"]
    
    #Calcul du consensus
    consensus = max(weighted_votes, key=weighted_votes.get)
    
    #Mettre à jour les poids et les soldes des modèles en fonction de leur précision par rapport au consensus
    for url, data in model_data.items():
        if data["prediction"] == consensus:
            #Augmentation du poids si prédiction du consensus
            db[url]["weight"] = min(1.0, db[url]["weight"] + 0.05)  
        else:
            #Diminution du poids si prédiction différente du consensus
            db[url]["weight"] = max(0.1, db[url]["weight"] - 0.1)  
            db[url]["balance"] -= SLASHING_PENALTY
            #Pas de balance négative
            if db[url]["balance"] < 0:  
                db[url]["balance"] = 0
                
    #Calculer la précision moyenne des modèles
    avg_accuracy = sum(accuracies) / len(accuracies) if accuracies else "N/A"
    
    #Sauvegarder la base de données mise à jour
    save_db(db)
    
    #Affichage des résultats
    print(f"Prédictions individuelles: {model_data}")
    print(f"Consensus final: {consensus}")
    print(f"Accuracy moyenne des modèles: {avg_accuracy:.2f}" if avg_accuracy != "N/A" else "Accuracy non disponible")
    print("Balances mises à jour :", db)
else:
    print("Aucune prédiction récupérée.")
    

